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
import {SublobUploadDataComponent} from './sublob-upload-data/sublob-upload-data.component';

@Component({
    selector: 'app-sub-lob',
    templateUrl: './sub-lob.component.html',
    styleUrls: ['./sub-lob.component.scss']
})
export class SubLOBComponent implements OnInit {

    SubLOBForm: FormGroup;
    SubLOBIndex: boolean = false;
    SubLOBCreate: boolean = false;
    lobs: any = [];
    filteredlobs: Observable<any[]>;
    displayedColumns: string[] = ['Id', 'SubLOBCode', 'SubLOBDesc', 'LOBCode', 'ValidityLimits', 'DefaultInitialApprover', 'IsActive'];
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
        this.SubLOBForm = this.formBuilder.group({
            Id: [''],
            LOBId: ['', [Validators.required]],
            SubLOBCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(100)]],
            SubLOBDesc: ['', [Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(2000)]],
            LOB: ['', [Validators.required]],
            ValidityLimits: ['', [Validators.required, Validators.pattern('[0-9]*'), Validators.maxLength(3)]],
            DefaultInitialApprover: [''],
            IsActive: [''],
        });
        this.getAllSubLOB();
        this.getAllLOB();
        this.filteredlobs = this.LOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filter(value) : this.lobs.slice())
            );
        this.userLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn'));
    }

    get Id() {
        return this.SubLOBForm.get('Id');
    }

    get LOBId() {
        return this.SubLOBForm.get("LOBId");
    }

    get SubLOBCode() {
        return this.SubLOBForm.get('SubLOBCode');
    }

    get SubLOBDesc() {
        return this.SubLOBForm.get('SubLOBDesc');
    }

    get LOB() {
        return this.SubLOBForm.get("LOB");
    }

    get ValidityLimits() {
        return this.SubLOBForm.get('ValidityLimits');
    }

    get DefaultInitialApprover() {
        return this.SubLOBForm.get('DefaultInitialApprover');
    }

    get IsActive() {
        return this.SubLOBForm.get('IsActive');
    }

    getAllSubLOB() {
        this.rest.getAll(this.global.getapiendpoint() + 'sublob/GetAllSubLOB').subscribe((data: any) => {
            let tabledata = [];
            data.Data.forEach(element => {
                tabledata.push({
                    Id: element.Id,
                    SubLOBCode: element.SubLOBCode,
                    SubLOBDesc: element.SubLOBDesc,
                    LOBCode: element.LOB.LOBCode,
                    ValidityLimits: element.ValidityLimits,
                    DefaultInitialApprover: element.DefaultInitialApprover,
                    IsActive: element.IsActive
                });
            });
            this.dataSource = new MatTableDataSource(tabledata);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
        this.SubLOBCreate = false;
        this.SubLOBIndex = true;
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getAllLOB() {
        this.lobs = [];
        this.rest.getAll(this.global.getapiendpoint() + "lob/GetAllActiveLOB").subscribe((data: any) => {
            this.lobs = data.Data;
        });
    }

    uploadSublob() {
        const dialogRef = this.dialog.open(SublobUploadDataComponent, {});
        dialogRef
            .afterClosed()
            .subscribe(() => {
                this.getAllSubLOB();
            });
    }

    inputLOB(lob: any) {
        this.LOBId.setValue("");
    }

    selectedLOB(lob: any): void {
        this.LOB.setValue(lob.LOBCode);
        this.LOBId.setValue(lob.Id);
    }

    private _filter(value: any): any {
        const filterValue = (value ? (value.LOBCode ? value.LOBCode.toLowerCase() : value.toLowerCase()) : "");
        return this.lobs.filter(o => o.LOBCode.toLowerCase().includes(filterValue));
    }

    addSubLOB() {
        this.form.resetForm();
        this.SubLOBForm.markAsUntouched();
        this.Id.setValue("");
        this.LOBId.setValue("");
        this.DefaultInitialApprover.setValue(false);
        this.IsActive.setValue(true);
        this.SubLOBCreate = true;
        this.SubLOBIndex = false;
    }

    backSubLOB() {
        this.SubLOBCreate = false;
        this.SubLOBIndex = true;
    }

    editSubLOB(Id: string) {
        this.rest.getById(this.global.getapiendpoint() + 'sublob/GetSubLOBById/', Id).subscribe((data: any) => {
            this.Id.setValue(data.Data.Id);
            this.LOBId.setValue(data.Data.LOBId);
            this.SubLOBCode.setValue(data.Data.SubLOBCode);
            this.SubLOBDesc.setValue(data.Data.SubLOBDesc);
            this.LOB.setValue(data.Data.LOB.LOBCode);
            this.ValidityLimits.setValue(data.Data.ValidityLimits);
            this.DefaultInitialApprover.setValue(data.Data.DefaultInitialApprover);
            this.IsActive.setValue(data.Data.IsActive);
            this.SubLOBCreate = true;
            this.SubLOBIndex = false;
        });
    }

    saveSubLOB() {
        this.rest.checkDuplicate(this.global.getapiendpoint() + 'sublob/CheckDuplicateSubLOB/', this.SubLOBCode.value, (this.Id.value !== '' ? this.Id.value : '0')).subscribe((data: any) => {
            if (data.Data) {
                this.toastr.showNotification('top', 'right', data.Message, 'danger');
            } else {
                var model: any = {
                    Id: this.Id.value,
                    SubLOBCode: this.SubLOBCode.value,
                    SubLOBDesc: this.SubLOBDesc.value,
                    LOBId: this.LOBId.value,
                    ValidityLimits: this.ValidityLimits.value,
                    DefaultInitialApprover: this.DefaultInitialApprover.value,
                    IsActive: this.IsActive.value,
                    UserId: this.userLoggedIn.Id,
                    UserRoleId: this.userLoggedIn.DefaultRoleId
                };
                var apiUrl = "";
                if (this.Id.value == "") {
                    apiUrl = 'sublob/CreateSubLOB';
                } else {
                    apiUrl = 'sublob/UpdateSubLOB';
                }
                this.rest.create(this.global.getapiendpoint() + apiUrl, model).subscribe((data: any) => {
                    this.toastr.showNotification('top', 'right', data.Message, 'success');
                    this.getAllSubLOB();
                });
            }
        });
    }

    exportSubLOB() {
        window.open(this.global.getapiendpoint() + 'sublob/Export', '_blank');
        this.toastr.showNotification('top', 'right', 'Sub LOB Master Exported Sucessfully', 'success');
    }

}
