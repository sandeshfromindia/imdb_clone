import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType, HttpRequest, HttpResponse} from '@angular/common/http';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {RestService} from 'app/services/rest.service';
import {Global} from 'app/common/global';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as Ajv from 'ajv';
import * as AjvError from 'ajv-errors';
import * as moment from 'moment';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
const ajv = new Ajv({allErrors: true});
AjvError(ajv);
const schemaRole = {
    'properties': {
        'ADUser': {'type': 'string', 'enum': ['yes', 'no', 'YES', 'NO', 'Yes', 'No']},
        'LoginId': {'type': 'string', 'pattern': '^[a-zA-Z0-9_]+$'},
        'EmpName': {'type': 'string', 'pattern': '^[a-zA-Z ]+$'},
        'EmailId': {'type': 'string', 'format': 'email'},
        'Entity': {'type': 'string', 'pattern': '^[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]+$'},
        'LOB': {'type': ['string', 'number']},
        'SubLOB': {'type': ['string', 'number']},
        'Approver': {'type': ['string', 'number']},
        'AllTerminalAccess': {'type': 'string', 'enum': ['yes', 'no', 'YES', 'NO', 'Yes', 'No']},
        'TerminalMapping': {'type': 'string', 'enum': ['yes', 'no', 'YES', 'NO', 'Yes', 'No']},
        'Role': {'type': ['string', 'number']},
    },
    'required': [
        'ADUser',
        'LoginId',
        'LOB',
        'SubLOB',
        'AllTerminalAccess',
        'TerminalMapping',
        'Role'
    ],
    'errorMessage': {
        'properties': {
            'ADUser': 'AD User should be in yes or no',
            'LoginId': 'Login Id should be alphanumeric with underscore',
            'EmpName': 'Employee Name should be string',
            'EmailId': 'Invalid Email Id',
            'Entity': 'Entity should be string',
            'AllTerminalAccess': 'All Terminal Access should be in yes or no',
            'TerminalMapping': 'Terminal Mapping should be in yes or no',
        },
        'required': {
            'ADUser': 'AD User is required',
            'LoginId': 'Login Id is required',
            'LOB': 'LOB is required',
            'SubLOB': 'Sub LOB is required',
            'AllTerminalAccess': 'All Terminal Access is required',
            'TerminalMapping': 'Terminal Mapping is required',
            'Role': 'Role is required',
        }
    }
};

@Injectable({
    providedIn: 'root'
})
export class UserUploadDataService {

    url: string;
    data: any;
    errorRows: any[];
    errorFlag = false;
    private columnsArray: string[];
    users: any[];
    lobs: any = [];
    sublobs: any = [];
    activities: any = [];
    roles: any = [];

    constructor(private http: HttpClient, private global: Global, private rest: RestService) {
        this.url = this.global.getapiendpoint() + 'user/BulkUpload';
        this.getAllUser();
        this.getAllLOB();
        this.getAllSubLOB();
        this.getAllActivity();
        this.getAllRole();
    }

    getAllUser() {
        this.users = [];
        this.rest.getAll(this.global.getapiendpoint() + 'user/GetAllUserList').subscribe((data: any) => {
            this.users = data.Data;
        });
    }

    getAllLOB() {
        this.lobs = [];
        this.rest.getAll(this.global.getapiendpoint() + 'lob/GetAllActiveLOB').subscribe((data: any) => {
            this.lobs = data.Data;
        });
    }

    getAllSubLOB() {
        this.sublobs = [];
        this.rest.getAll(this.global.getapiendpoint() + 'sublob/GetAllActiveSubLOB').subscribe((data: any) => {
            this.sublobs = data.Data;
        });
    }

    getAllActivity() {
        this.activities = [];
        this.rest.getAll(this.global.getapiendpoint() + 'activity/GetAllActiveActivity').subscribe((data: any) => {
            this.activities = data.Data;
        });
    }

    getAllRole() {
        this.roles = [];
        this.rest.getAll(this.global.getapiendpoint() + 'role/GetAllActiveRole').subscribe((data: any) => {
            this.roles = data.Data;
        });
    }

    public upload(files: Set<File>): { [key: string]: { progress: Observable<number> } } {
        const status: { [key: string]: { progress: Observable<number> } } = {};

        files.forEach(file => {
            const formData: FormData = new FormData();
            formData.append('file', file, file.name);

            const req = new HttpRequest('POST', this.url, formData, {
                reportProgress: true
            });

            const progress = new Subject<number>();
            const startTime = new Date().getTime();

            this.http.request(req).subscribe(event => {
                if (event.type === HttpEventType.UploadProgress) {
                    const percentDone = Math.round((100 * event.loaded) / event.total);
                    progress.next(percentDone);
                } else if (event instanceof HttpResponse) {
                    progress.complete();
                }
            });

            status[file.name] = {
                progress: progress.asObservable()
            };
        });

        return status;
    }

    public uploadData(data: any) {
        const model = {
            data: data.Data,
            UserId: data.UserId,
            UserRoleId: data.UserRoleId,
        };
        return this.rest.create(this.url, model);
    }

    // tslint:disable-next-line:max-line-length
    public validateFile(files: Set<File>): { [key: string]: { progress: Observable<number>, error: Observable<boolean>, data: any, columns: any } } {
        const status: { [key: string]: { progress: Observable<number>, error: Observable<boolean>, data: any, columns: any } } = {};
        const reader: FileReader = new FileReader();
        this.errorFlag = false;
        files.forEach(file => {
            const progress = new Subject<number>();
            const error = new Subject<boolean>();
            const finalData = [];
            const columns = [];
            reader.onload = (e: any) => {

                const bstr: string = e.target.result;
                const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary', cellDates: true});
                const wsname: string = wb.SheetNames[0];
                const ws: XLSX.WorkSheet = wb.Sheets[wsname];
                const columnsArray = this.getHeaders(ws);
                columns.push('Error');
                columnsArray.forEach((d, i) => {
                    columns.push(d);
                });


                const validate = ajv.compile(schemaRole);
                this.data = (XLSX.utils.sheet_to_json(ws, {header: 0}));
                this.data.forEach((row, index) => {
                    let errorflg = false;
                    this.data[index].Error = '';
                    const valid = validate(this.data[index]);
                    if (!valid) {
                        this.errorFlag = true;
                        this.data[index].Error += ' | ' + validate.errors.map((rw, ind) => {
                            return rw.message;
                        });
                    }

                    const percentDone = Math.round((100 * index + 1) / this.data.length);
                    progress.next(percentDone);

                    // tslint:disable-next-line:max-line-length
                    const objDuplicate = this.data.filter(en => en.LoginId.toString().toLowerCase().trim() === row.LoginId.toString().toLowerCase().trim());
                    if (objDuplicate.length > 1) {
                        this.data[index].Error += ' | Duplicate records';
                        this.errorFlag = true;
                    }

                    const objUser = this.users.find(en => en.LoginId.toLowerCase() === row.LoginId.toString().toLowerCase().trim());
                    if (objUser) {
                        this.data[index].Error += ' | User already exist';
                        this.errorFlag = true;
                    }

                    if (row.ADUser.toLowerCase() === 'yes') {
                        if (row.LoginId !== undefined && row.LoginId.toString().trim() !== '') {
                            this.rest.getAll(
                                this.global.getapiendpoint() + 'ad/FindUser/'
                                    .concat(row.LoginId.toString().trim())).subscribe((data: any) => {
                                if (data.Success) {
                                    this.data[index].LoginId = data.Data.sAMAccountName;
                                    this.data[index].EmpCode = data.Data.description;
                                    this.data[index].EmpName = data.Data.cn;
                                    this.data[index].EmailId = data.Data.mail;
                                    this.data[index].Entity = data.Data.company;
                                } else {
                                    this.data[index].Error += ' | Invalid Login Id';
                                    this.errorFlag = true;
                                }
                            });
                        }
                    } else {
                        if (row.EmpName === undefined || row.EmpName.toString().trim() === '') {
                            this.data[index].Error += ' | Employee Name is required';
                            this.errorFlag = true;
                        }
                        if (row.EmailId === undefined || row.EmailId.toString().trim() === '') {
                            this.data[index].Error += ' | Email Id is required';
                            this.errorFlag = true;
                        }
                        if (row.Entity === undefined || row.Entity.toString().trim() === '') {
                            this.data[index].Error += ' | Entity is required';
                            this.errorFlag = true;
                        }
                    }

                    const lob = row.LOB.split(',');
                    const lobId = [];
                    errorflg = false;
                    lob.forEach(element => {
                        if (element) {
                            const objLOB = this.lobs.find(en => en.LOBCode.toLowerCase() === element.toString().toLowerCase());
                            if (objLOB) {
                                lobId.push(objLOB.Id);
                            } else {
                                errorflg = true;
                            }
                        }
                    });
                    if (lobId && !errorflg) {
                        this.data[index].LOBId = lobId;
                    } else {
                        this.data[index].Error += ' | Invalid LOB';
                        this.errorFlag = true;
                    }

                    const sublob = row.SubLOB.split(',');
                    const sublobId = [];
                    errorflg = false;
                    sublob.forEach(element => {
                        if (element) {
                            const objSubLOB = this.sublobs.find(en => en.SubLOBCode.toLowerCase() === element.toString().toLowerCase());
                            if (objSubLOB) {
                                sublobId.push(objSubLOB.Id);
                            } else {
                                errorflg = true;
                            }
                        }
                    });
                    if (sublobId && !errorflg) {
                        this.data[index].SubLOBId = sublobId;
                    } else {
                        this.data[index].Error += ' | Invalid Sub LOB';
                        this.errorFlag = true;
                    }

                    if (row.Approver !== undefined && row.Approver.toString().trim() !== '') {
                        const activity = row.Approver.split(',');
                        const activityId = [];
                        errorflg = false;
                        activity.forEach(element => {
                            if (element) {
                                const objActivity = this.activities
                                    .find(en => en.ActivityCode.toLowerCase() === element.toString().toLowerCase());
                                if (objActivity) {
                                    activityId.push(objActivity.Id);
                                } else {
                                    errorflg = true;
                                }
                            }
                        });
                        if (activityId && !errorflg) {
                            this.data[index].ActivityId = activityId;
                        } else {
                            this.data[index].Error += ' | Invalid Approver';
                            this.errorFlag = true;
                        }
                    } else {
                        this.data[index].ActivityId = [];
                    }

                    const role = row.Role.split(',');
                    const roleId = [];
                    errorflg = false;
                    role.forEach(element => {
                        if (element) {
                            const objRole = this.roles.find(en => en.RoleCode.toLowerCase() === element.toString().toLowerCase());
                            if (objRole) {
                                roleId.push(objRole.Id);
                            } else {
                                errorflg = true;
                            }
                        }
                    });
                    if (roleId && !errorflg) {
                        this.data[index].RoleId = roleId;
                    } else {
                        this.data[index].Error += ' | Invalid Role';
                        this.errorFlag = true;
                    }

                    finalData.push(this.data[index]);

                    if (this.errorFlag) {
                        error.next(true);
                    } else {
                        error.next(false);
                    }
                });
                progress.complete();
                error.complete();
            };
            reader.readAsBinaryString(file);
            status['upload-status'] = {
                progress: progress.asObservable(),
                error: error.asObservable(),
                data: finalData,
                columns: columns
            };
        });
        return status;
    }

    public exportAsExcelFile(json: any[], excelFileName: string): void {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
        const excelBuffer: any = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
        this.saveAsExcelFile(excelBuffer, excelFileName);
    }

    private saveAsExcelFile(buffer: any, fileName: string): void {
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }

    private getHeaders(sheet) {
        let header = 0, offset = 1;
        const hdr = [];
        const o = {
            range: undefined,
            header: undefined
        };
        if (sheet == null || sheet['!ref'] == null) {
            return [];
        }
        const range = o.range !== undefined ? o.range : sheet['!ref'];
        let r;
        if (o.header === 1) {
            header = 1;
        } else if (o.header === 'A') {
            header = 2;
        } else if (Array.isArray(o.header)) {
            header = 3;
        }
        switch (typeof range) {
            case 'string':
                r = this.safe_decode_range(range);
                break;
            case 'number':
                r = this.safe_decode_range(sheet['!ref']);
                r.s.r = range;
                break;
            default:
                r = range;
        }
        if (header > 0) {
            offset = 0;
        }
        const rr = XLSX.utils.encode_row(r.s.r);
        const cols = new Array(r.e.c - r.s.c + 1);
        for (let C = r.s.c; C <= r.e.c; ++C) {
            cols[C] = XLSX.utils.encode_col(C);
            const val = sheet[cols[C] + rr];
            switch (header) {
                case 1:
                    hdr.push(C);
                    break;
                case 2:
                    hdr.push(cols[C]);
                    break;
                case 3:
                    hdr.push(o.header[C - r.s.c]);
                    break;
                default:
                    if (val === undefined) { continue; }
                    hdr.push(XLSX.utils.format_cell(val));
            }
        }
        return hdr;
    }

    private safe_decode_range(range) {
        const o = {s: {c: 0, r: 0}, e: {c: 0, r: 0}};
        let idx = 0, i = 0, cc = 0;
        const len = range.length;
        for (idx = 0; i < len; ++i) {
            if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) {
                break;
            }
            idx = 26 * idx + cc;
        }
        o.s.c = --idx;

        for (idx = 0; i < len; ++i) {
            if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) {
                break;
            }
            idx = 10 * idx + cc;
        }
        o.s.r = --idx;

        if (i === len || range.charCodeAt(++i) === 58) {
            o.e.c = o.s.c;
            o.e.r = o.s.r;
            return o;
        }

        for (idx = 0; i !== len; ++i) {
            if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) {
                break;
            }
            idx = 26 * idx + cc;
        }
        o.e.c = --idx;

        // tslint:disable-next-line:triple-equals
        for (idx = 0; i != len; ++i) {
            if ((cc = range.charCodeAt(i) - 48) < 0 || cc > 9) {
                break;
            }
            idx = 10 * idx + cc;
        }
        o.e.r = --idx;
        return o;
    }

}
