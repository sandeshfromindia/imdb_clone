import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RestService} from 'app/services/rest.service';
import {Global} from 'app/common/global';
import {FormControl, Validators, FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef, MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {Toastr} from 'app/common/toastr';
import {Location} from '@angular/common';
import {RoleUploadDataComponent} from './role-upload-data/role-upload-data.component';

@Component({
    selector: 'app-role',
    templateUrl: './role.component.html',
    styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {

    RoleForm: FormGroup;
    RoleIndex: boolean = false;
    RoleCreate: boolean = false;
    displayedColumns: string[] = ['Id', 'RoleCode', 'RoleDesc', 'IsActive'];
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
        this.RoleForm = this.formBuilder.group({
            Id: [''],
            RoleCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(100)]],
            RoleDesc: ['', [Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(2000)]],
            IsActive: [''],
        });
        this.getAllRole();
        this.userLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn'));
    }

    get Id() {
        return this.RoleForm.get('Id');
    }

    get RoleCode() {
        return this.RoleForm.get('RoleCode');
    }

    get RoleDesc() {
        return this.RoleForm.get('RoleDesc');
    }

    get IsActive() {
        return this.RoleForm.get('IsActive');
    }

    getAllRole() {
        this.rest.getAll(this.global.getapiendpoint() + 'role/GetAllRole').subscribe((data: any) => {
            let tabledata = [];
            data.Data.forEach(element => {
                tabledata.push({
                    Id: element.Id,
                    RoleCode: element.RoleCode,
                    RoleDesc: element.RoleDesc,
                    IsActive: element.IsActive
                });
            });
            this.dataSource = new MatTableDataSource(tabledata);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
        this.RoleCreate = false;
        this.RoleIndex = true;
    }

    uploadRole() {
        const dialogRef = this.dialog.open(RoleUploadDataComponent, {});
        dialogRef
            .afterClosed()
            .subscribe(() => {
                this.getAllRole();
            });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    addRole() {
        this.form.resetForm();
        this.RoleForm.markAsUntouched();
        this.Id.setValue("");
        this.IsActive.setValue(true);
        this.RoleCreate = true;
        this.RoleIndex = false;
    }

    backRole() {
        this.RoleCreate = false;
        this.RoleIndex = true;
    }

    editRole(Id: string) {
        this.rest.getById(this.global.getapiendpoint() + 'role/GetRoleById/', Id).subscribe((data: any) => {
            this.Id.setValue(data.Data.Id);
            this.RoleCode.setValue(data.Data.RoleCode);
            this.RoleDesc.setValue(data.Data.RoleDesc);
            this.IsActive.setValue(data.Data.IsActive);
            this.RoleCreate = true;
            this.RoleIndex = false;
        });
    }

    saveRole() {
        this.rest.checkDuplicate(this.global.getapiendpoint() + 'role/CheckDuplicateRole/', this.RoleCode.value, (this.Id.value !== '' ? this.Id.value : '0')).subscribe((data: any) => {
            if (data.Data) {
                this.toastr.showNotification('top', 'right', data.Message, 'danger');
            } else {
                var model: any = {
                    Id: this.Id.value,
                    RoleCode: this.RoleCode.value,
                    RoleDesc: this.RoleDesc.value,
                    IsActive: this.IsActive.value,
                    UserId: this.userLoggedIn.Id,
                    UserRoleId: this.userLoggedIn.DefaultRoleId
                };
                var apiUrl = "";
                if (this.Id.value == "") {
                    apiUrl = 'role/CreateRole';
                } else {
                    apiUrl = 'role/UpdateRole';
                }
                this.rest.create(this.global.getapiendpoint() + apiUrl, model).subscribe((data: any) => {
                    this.toastr.showNotification('top', 'right', data.Message, 'success');
                    this.getAllRole();
                });
            }
        });
    }

    exportRole() {
        window.open(this.global.getapiendpoint() + 'role/Export', '_blank');
        this.toastr.showNotification('top', 'right', 'Role Master Exported Sucessfully', 'success');
    }

}
