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
let ajv = new Ajv({allErrors: true});
AjvError(ajv);
const schemaRole = {
    'properties': {
        'ServerCode': {'type': ['string', 'number'], 'pattern': '^[a-zA-Z0-9\\(\\)\\-&.\\\\,/_]+$'},
        'ServerDesc': {'type': ['string', 'number'], 'pattern': '^[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]+$', 'maxLength': 2000},
        'ServerIP': {'type': ['string', 'number'], 'pattern': '^[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]+$', 'maxLength': 12},
        'AutoUploaderStatus': {'type': 'string', 'enum': ['yes', 'no', 'YES', 'NO', 'Yes', 'No']},
        'FileUploaderPath': {
            'type': ['string', 'number'],
            'pattern': '^[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]+$',
            'maxLength': 2000
        },
        'ReconExclusion': {'type': 'string', 'enum': ['yes', 'no', 'YES', 'NO', 'Yes', 'No']},
        'MaxUserLimit': {'type': ['string', 'number'], 'pattern': '^[0-9]+$', 'maxLength': 3},
    },

    'required': [
        'ServerCode',
        'ServerIP',
        'AutoUploaderStatus',
        'ReconExclusion',
        'MaxUserLimit',
    ],
    'errorMessage': {
        'properties': {
            'ServerCode': 'Server Code should be alphanumeric',
            'ServerDesc': 'Server Description should be alphanumeric with max characters 2000',
            'ServerIP': 'Server IP should be alphanumeric with max characters 100',
            'AutoUploaderStatus': 'Auto Uploader Status should either in yes or no',
            'FileUploaderPath': 'File Uploader Path should be alphanumeric with max characters 2000',
            'ReconExclusion': 'Recon Exclusion should be either yes or no',
            'MaxUserLimit': 'MaxUser Limit should be number with max digit 3',
        },
        'required': {
            'ServerCode': 'Server Code is required',
            'ServerIP': 'Server IP is required',
            'AutoUploaderStatus': 'Auto Uploader Status is required',
            'ReconExclusion': 'Recon Exclusion is required',
            'MaxUserLimit': 'Max User Limit is required',
        }
    }
};

@Injectable({
    providedIn: 'root'
})
export class ServerUploadDataService {

    url: string;
    data: any;
    errorRows: any[];
    errorFlag: boolean = false;
    private columnsArray: string[];
    servers: any = [];

    constructor(private http: HttpClient, private global: Global, private rest: RestService) {
        this.url = this.global.getapiendpoint() + 'server/BulkUpload';
        this.getAllServer();
    }

    getAllServer() {
        this.servers = [];
        this.rest.getAll(this.global.getapiendpoint() + "server/GetAllServerList").subscribe((data: any) => {
            this.servers = data.Data;
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

                    const objDuplicate = this.data.filter(en => en.ServerCode.toString().toLowerCase().trim() == row.ServerCode.toString().toLowerCase().trim());
                    if (objDuplicate.length > 1) {
                        this.data[index].Error += ' | Duplicate records';
                        this.errorFlag = true;
                    }

                    const objServer = this.servers.find(en => en.ServerCode.toLowerCase() == row.ServerCode.toString().toLowerCase().trim());
                    if (objServer) {
                        this.data[index].Error += ' | Server already exist';
                        this.errorFlag = true;
                    }

                    if (row.AutoUploaderStatus.toLowerCase() == 'yes' && (row.FileUploaderPath == undefined || row.FileUploaderPath.trim() == '')) {
                        this.data[index].Error += ' | File Uploader Path is required';
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
        let hdr = [];
        let o = {
            range: undefined,
            header: undefined
        };
        if (sheet == null || sheet['!ref'] == null) {
            return [];
        }
        let range = o.range !== undefined ? o.range : sheet["!ref"];
        let r;
        if (o.header == 1) {
            header = 1;
        } else if (o.header === "A") {
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
        let rr = XLSX.utils.encode_row(r.s.r);
        let cols = new Array(r.e.c - r.s.c + 1);
        for (var C = r.s.c; C <= r.e.c; ++C) {
            cols[C] = XLSX.utils.encode_col(C);
            let val = sheet[cols[C] + rr];
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
                    if (val === undefined) continue;
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

        for (idx = 0; i != len; ++i) {
            if ((cc = range.charCodeAt(i) - 64) < 1 || cc > 26) {
                break;
            }
            idx = 26 * idx + cc;
        }
        o.e.c = --idx;

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
