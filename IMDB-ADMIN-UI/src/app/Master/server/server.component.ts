import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RestService} from 'app/services/rest.service';
import {Global} from 'app/common/global';
import {FormControl, Validators, FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef, MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {Toastr} from 'app/common/toastr';
import {Location} from '@angular/common';
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import {ServerUploadDataComponent} from './server-upload-data/server-upload-data.component';

@Component({
    selector: 'app-server',
    templateUrl: './server.component.html',
    styleUrls: ['./server.component.scss']
})
export class ServerComponent implements OnInit {

    ServerForm: FormGroup;
    ServerIndex: boolean = false;
    ServerCreate: boolean = false;
    lobs: any = [];
    filteredlobs: Observable<any[]>;
    displayedColumns: string[] = ['Id', 'ServerCode', 'ServerDesc', 'ServerIP', 'FileUploaderPath', 'AutoUploaderStatus', 'ReconExclusion', 'MaxUserLimit', 'IsActive'];
    dataSource;
    userLoggedIn: any;
    location: Location;
    UIObj: any;
    IsMaker: boolean;
    IsChecker: boolean;
    IsExport: boolean;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('form') form;

    constructor(location: Location, private formBuilder: FormBuilder, private rest: RestService, private route: ActivatedRoute, private router: Router, private global: Global, private toastr: Toastr, public dialog: MatDialog) {
        this.location = location;
    }

    ngOnInit() {
        var path = this.location.prepareExternalUrl(this.location.path());
        if (path.charAt(0) === '#') {
            path = path.slice(2);
        }
        this.UIObj = this.global.getUIObj(path);
        this.IsMaker = this.UIObj.UIRoles[0].Maker;
        this.IsExport = this.UIObj.UIRoles[0].Export;
        this.ServerForm = this.formBuilder.group({
            Id: [''],
            ServerCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_]*'), Validators.maxLength(100)]],
            ServerDesc: ['', [Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(2000)]],
            ServerIP: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(100)]],
            AutoUploaderStatus: [''],
            FileUploaderPath: ['', [Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(2000)]],
            ReconExclusion: [''],
            MaxUserLimit: ['', [Validators.required, Validators.pattern('[0-9]*'), Validators.maxLength(3)]],
            IsActive: [''],
        });

        this.getAllServer();
        this.userLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn'));
    }

    get Id() {
        return this.ServerForm.get('Id');
    }

    get ServerCode() {
        return this.ServerForm.get('ServerCode');
    }

    get ServerDesc() {
        return this.ServerForm.get('ServerDesc');
    }

    get ServerIP() {
        return this.ServerForm.get('ServerIP');
    }

    get FileUploaderPath() {
        return this.ServerForm.get('FileUploaderPath');
    }

    get AutoUploaderStatus() {
        return this.ServerForm.get('AutoUploaderStatus');
    }

    get ReconExclusion() {
        return this.ServerForm.get('ReconExclusion');
    }

    get MaxUserLimit() {
        return this.ServerForm.get("MaxUserLimit");
    }

    get IsActive() {
        return this.ServerForm.get('IsActive');
    }

    getAllServer() {
        this.rest.getAll(this.global.getapiendpoint() + 'Server/GetAllServer').subscribe((data: any) => {
            let tabledata = [];
            data.Data.forEach(element => {
                tabledata.push({
                    Id: element.Id, ServerCode: element.ServerCode,
                    ServerDesc: element.ServerDesc, ServerIP: element.ServerIP,
                    FileUploaderPath: element.FileUploaderPath,
                    AutoUploaderStatus: element.AutoUploaderStatus,
                    ReconExclusion: element.ReconExclusion,
                    MaxUserLimit: element.MaxUserLimit,
                    IsActive: element.IsActive
                });
            });
            this.dataSource = new MatTableDataSource(tabledata);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
        this.ServerCreate = false;
        this.ServerIndex = true;
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    uploadServer() {
        const dialogRef = this.dialog.open(ServerUploadDataComponent, {});
        dialogRef
            .afterClosed()
            .subscribe(() => {
                this.getAllServer();
            });
    }

    onAutoUploaderStatusChange(value) {
        if (!this.AutoUploaderStatus.value) {
            this.FileUploaderPath.setValidators([Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(2000)]);
            this.FileUploaderPath.updateValueAndValidity();
        } else {
            this.FileUploaderPath.setValidators([Validators.required, Validators.pattern("[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*"), Validators.maxLength(2000)]);
            this.FileUploaderPath.updateValueAndValidity();
            this.FileUploaderPath.markAsUntouched();
        }
    }

    getFileUploaderPathErrorMessage() {
        return this.FileUploaderPath.hasError('required') ? 'File Uploader Path is required' :
            this.FileUploaderPath.hasError('pattern') ? 'Please enter a valid File Uploader Path' :
                this.FileUploaderPath.hasError('maxlength') ? 'This field should have less than 2000 characters' :
                    '';
    }

    addServer() {
        this.form.resetForm();
        this.ServerForm.markAsUntouched();
        this.Id.setValue("");
        this.ServerIP.setValue("");
        this.MaxUserLimit.setValue("");
        this.ReconExclusion.setValue(false);
        this.AutoUploaderStatus.setValue(false);
        this.onAutoUploaderStatusChange(this.AutoUploaderStatus);
        this.IsActive.setValue(true);
        this.ServerCreate = true;
        this.ServerIndex = false;
    }

    backServer() {
        this.ServerCreate = false;
        this.ServerIndex = true;
    }

    editServer(Id: string) {
        this.rest.getById(this.global.getapiendpoint() + 'Server/GetServerById/', Id).subscribe((data: any) => {
            this.Id.setValue(data.Data.Id);
            this.ServerIP.setValue(data.Data.ServerIP);
            this.ServerCode.setValue(data.Data.ServerCode);
            this.ServerDesc.setValue(data.Data.ServerDesc);
            this.FileUploaderPath.setValue(data.Data.FileUploaderPath);
            this.MaxUserLimit.setValue(data.Data.MaxUserLimit);
            this.ReconExclusion.setValue(data.Data.ReconExclusion);
            this.AutoUploaderStatus.setValue(data.Data.AutoUploaderStatus);
            this.IsActive.setValue(data.Data.IsActive);
            this.ServerCreate = true;
            this.ServerIndex = false;
        });
    }

    saveServer() {
        this.rest.checkDuplicate(this.global.getapiendpoint() + 'Server/CheckDuplicateServer/', this.ServerCode.value, (this.Id.value !== '' ? this.Id.value : '0')).subscribe((data: any) => {
            if (data.Data) {
                this.toastr.showNotification('top', 'right', data.Message, 'danger');
            } else {
                var model: any = {
                    Id: this.Id.value,
                    ServerCode: this.ServerCode.value,
                    ServerDesc: this.ServerDesc.value,
                    ServerIP: this.ServerIP.value,
                    FileUploaderPath: this.FileUploaderPath.value,
                    MaxUserLimit: this.MaxUserLimit.value,
                    ReconExclusion: this.ReconExclusion.value,
                    AutoUploaderStatus: this.AutoUploaderStatus.value,
                    IsActive: this.IsActive.value,
                    UserId: this.userLoggedIn.Id,
                    UserRoleId: this.userLoggedIn.DefaultRoleId
                };
                var apiUrl = "";
                if (this.Id.value == "") {
                    apiUrl = 'Server/CreateServer';
                } else {
                    apiUrl = 'Server/UpdateServer';
                }
                this.rest.create(this.global.getapiendpoint() + apiUrl, model).subscribe((data: any) => {
                    this.toastr.showNotification('top', 'right', data.Message, 'success');
                    this.getAllServer();
                });
            }
        });
    }

    exportServer() {
        window.open(this.global.getapiendpoint() + 'Server/Export', '_blank');
        this.toastr.showNotification('top', 'right', 'Server Master Exported Sucessfully', 'success');
    }

}
