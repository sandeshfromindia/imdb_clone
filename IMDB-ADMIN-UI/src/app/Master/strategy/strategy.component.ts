import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RestService} from 'app/services/rest.service';
import {Global} from 'app/common/global';
import {FormControl, Validators, FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog, MatDialogRef, MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {Toastr} from 'app/common/toastr';
import {Location} from '@angular/common';
import {startWith, map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ElementRef} from '@angular/core';
import {MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete} from '@angular/material';
import {StrategyUploadDataComponent} from 'app/master/strategy/strategy-upload-data/strategy-upload-data.component';

@Component({
    selector: 'app-strategy',
    templateUrl: './strategy.component.html',
    styleUrls: ['./strategy.component.scss']
})
export class StrategyComponent implements OnInit {

    StrategyForm: FormGroup;
    StrategyIndex = false;
    StrategyCreate = false;
    displayedColumns: string[] = ['Id', 'StrategyCode', 'StrategyDesc', 'LOBCode', 'SubLOBCode', 'PlatformCode', 'IsActive'];
    dataSource;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('form') form;
    location: Location;
    UIObj: any;
    IsMaker: boolean;
    IsChecker: boolean;
    IsExport: boolean;
    userLoggedIn: any;
    lobs: any = [];
    filteredlobs: Observable<any[]>;
    sublobs: any = [];
    filteredsublobs: Observable<any[]>;
    //Platform multiple dropdown
    separatorKeysCodes: number[] = [ENTER, COMMA];
    platforms: any = [];
    allPlatforms: any[] = [];
    allPlatformsInit: any[] = [];
    filteredPlatforms: Observable<any[]>;
    @ViewChild('platformInput') platformInput: ElementRef<HTMLInputElement>;
    @ViewChild('autoPlatform') autoPlatform: MatAutocomplete;
    @ViewChild('platformList') platformList;

    constructor(location: Location, private formBuilder: FormBuilder, private rest: RestService, private route: ActivatedRoute, private router: Router, private global: Global, private toastr: Toastr, public dialog: MatDialog) {
        this.location = location;
    }

    ngOnInit() {
        let path = this.location.prepareExternalUrl(this.location.path());
        if (path.charAt(0) === '#') {
            path = path.slice(2);
        }
        this.UIObj = this.global.getUIObj(path);
        this.IsMaker = this.UIObj.UIRoles[0].Maker;
        this.IsExport = this.UIObj.UIRoles[0].Export;
        this.StrategyForm = this.formBuilder.group({
            Id: [''],
            LOBId: ['', [Validators.required]],
            SubLOBId: ['', [Validators.required]],
            PlatformId: [''],
            StrategyCode: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(100)]],
            StrategyDesc: ['', [Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(2000)]],
            LOB: ['', [Validators.required]],
            SubLOB: ['', [Validators.required]],
            Platform: [''],
            IsActive: ['']
        });
        this.getAllStrategy();
        this.getAllLOB();
        this.getAllPlatform();
        this.filteredlobs = this.LOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterLobs(value) : this.lobs.slice())
            );
        this.filteredsublobs = this.SubLOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterSubLobs(value) : this.sublobs.slice())
            );
        //Platform multiple dropdown
        this.filteredPlatforms = this.Platform.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterPlatforms(value) : this.allPlatforms.slice())
            );
        this.userLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn'));
    }

    get Id() {
        return this.StrategyForm.get('Id');
    }

    get LOBId() {
        return this.StrategyForm.get('LOBId');
    }

    get SubLOBId() {
        return this.StrategyForm.get('SubLOBId');
    }

    get PlatformId() {
        return this.StrategyForm.get('PlatformId');
    }

    get StrategyCode() {
        return this.StrategyForm.get('StrategyCode');
    }

    get StrategyDesc() {
        return this.StrategyForm.get('StrategyDesc');
    }

    get LOB() {
        return this.StrategyForm.get('LOB');
    }

    get SubLOB() {
        return this.StrategyForm.get('SubLOB');
    }

    get Platform() {
        return this.StrategyForm.get('Platform');
    }

    get IsActive() {
        return this.StrategyForm.get('IsActive');
    }

    getAllStrategy() {
        this.rest.getAll(this.global.getapiendpoint() + 'strategy/GetAllStrategy').subscribe((data: any) => {
            const tabledata = [];
            data.Data.forEach(element => {
                let platformCode = '';
                element.StrategyPlatforms.forEach(platformelement => {
                    platformCode += ', ' + platformelement.Platform.PlatformCode;
                });
                platformCode = platformCode.substr(2, platformCode.length);
                tabledata.push({
                    Id: element.Id,
                    StrategyCode: element.StrategyCode,
                    StrategyDesc: element.StrategyDesc,
                    LOBCode: element.LOB.LOBCode,
                    SubLOBCode: element.SubLOB.SubLOBCode,
                    PlatformCode: platformCode,
                    IsActive: element.IsActive
                });
            });
            this.dataSource = new MatTableDataSource(tabledata);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
        this.StrategyCreate = false;
        this.StrategyIndex = true;
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    uploadStrategy() {
        const dialogRef = this.dialog.open(StrategyUploadDataComponent, {});
        dialogRef
            .afterClosed()
            .subscribe(() => {
                this.getAllStrategy();
            });
    }

    getAllLOB() {
        this.lobs = [];
        this.rest.getAll(this.global.getapiendpoint() + 'lob/GetAllActiveLOB').subscribe((data: any) => {
            this.lobs = data.Data;
        });
    }

    getAllSubLOB(LOBId: any) {
        this.sublobs = [];
        this.rest.getAll(this.global.getapiendpoint() + 'sublob/GetSubLOBByLOBId/'.concat(LOBId)).subscribe((data: any) => {
            this.sublobs = data.Data;

            this.filteredsublobs = this.SubLOB.valueChanges
                .pipe(
                    startWith(null),
                    map((value: any | null) => value ? this._filterSubLobs(value) : this.sublobs.slice())
                );
        });
    }

    getAllPlatform() {
        this.allPlatformsInit = [];
        this.rest.getAll(this.global.getapiendpoint() + 'platform/GetAllActivePlatform').subscribe((data: any) => {
            this.allPlatformsInit = data.Data;
        });
    }

    inputLOB(lob: any) {
        this.LOBId.setValue('');
    }

    selectedLOB(lob: any): void {
        this.LOB.setValue(lob.LOBCode);
        this.LOBId.setValue(lob.Id);
        this.getAllSubLOB(lob.Id);
    }

    private _filterLobs(value: any): any {
        const filterValue = (value ? (value.LOBCode ? value.LOBCode.toLowerCase() : value.toLowerCase()) : '');
        return this.lobs.filter(o => o.LOBCode.toLowerCase().includes(filterValue));
    }

    inputSubLOB(sublob: any) {
        this.SubLOBId.setValue('');
    }

    selectedSubLOB(sublob: any): void {
        this.SubLOB.setValue(sublob.SubLOBCode);
        this.SubLOBId.setValue(sublob.Id);
    }

    private _filterSubLobs(value: any): any {
        const filterValue = (value ? (value.SubLOBCode ? value.SubLOBCode.toLowerCase() : value.toLowerCase()) : '');
        return this.sublobs.filter(o => o.SubLOBCode.toLowerCase().includes(filterValue));
    }

    //Platform multiple dropdown
    addPlatform(event: MatChipInputEvent): void {
        if (!this.autoPlatform.isOpen) {
            const input = event.input;
            if (input) {
                input.value = '';
            }
            this.Platform.setValue(null);
        }
        if (this.platforms.length == 0) {
            this.platformList.errorState = true;
        } else {
            this.platformList.errorState = false;
        }
    }

    removePlatform(platform: any): void {
        const index = this.platforms.indexOf(platform);
        if (index >= 0) {
            this.platforms.splice(index, 1);
        }
        if (this.platforms.length == 0) {
            this.PlatformId.setValue('');
        }
        this.allPlatforms.push(platform);
        this.filteredPlatforms = this.Platform.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterPlatforms(value) : this.allPlatforms.slice())
            );
        if (this.platforms.length == 0) {
            this.platformList.errorState = true;
        } else {
            this.platformList.errorState = false;
        }
    }

    selectedPlatform(event: MatAutocompleteSelectedEvent): void {
        this.platforms.push(event.option.value);
        this.platformInput.nativeElement.value = '';
        this.Platform.setValue(null);
        this.PlatformId.setValue(this.platforms);
        const index = this.allPlatforms.indexOf(event.option.value);
        if (index >= 0) {
            this.allPlatforms.splice(index, 1);
        }
        this.filteredPlatforms = this.Platform.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterPlatforms(value) : this.allPlatforms.slice())
            );
        if (this.platforms.length == 0) {
            this.platformList.errorState = true;
        } else {
            this.platformList.errorState = false;
        }
    }

    private _filterPlatforms(value: any): any[] {
        const filterValue = (value ? (value.PlatformCode ? value.PlatformCode.toLowerCase() : value.toLowerCase()) : '');
        return this.allPlatforms.filter(o => o.PlatformCode.toLowerCase().includes(filterValue));
    }

    //Platform multiple dropdown

    addStrategy() {
        this.form.resetForm();
        this.StrategyForm.markAsUntouched();
        this.Id.setValue('');
        this.LOBId.setValue('');
        this.SubLOBId.setValue('');
        this.IsActive.setValue(true);
        //Platform multiple dropdown
        this.PlatformId.setValue('');
        this.PlatformId.setValidators([Validators.required]);
        this.PlatformId.updateValueAndValidity();
        this.platforms = [];
        this.allPlatforms = [];
        this.allPlatformsInit.forEach(element => {
            this.allPlatforms.push(element);
        });
        this.Platform.setValue('');
        this.filteredPlatforms = this.Platform.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterPlatforms(value) : this.allPlatforms.slice())
            );
        this.platformList.errorState = true;

        this.StrategyCreate = true;
        this.StrategyIndex = false;
    }

    backStrategy() {
        this.StrategyCreate = false;
        this.StrategyIndex = true;
    }

    editStrategy(Id: string) {
        this.rest.getById(this.global.getapiendpoint() + 'strategy/GetStrategyById/', Id).subscribe((data: any) => {
            this.Id.setValue(data.Data.Id);
            this.LOBId.setValue(data.Data.LOBId);
            this.SubLOBId.setValue(data.Data.SubLOBId);
            this.StrategyCode.setValue(data.Data.StrategyCode);
            this.StrategyDesc.setValue(data.Data.StrategyDesc);
            this.LOB.setValue(data.Data.LOB.LOBCode);
            this.SubLOB.setValue(data.Data.SubLOB.SubLOBCode);
            this.getAllSubLOB(data.Data.LOBId);
            this.IsActive.setValue(data.Data.IsActive);
            //Platform multiple dropdown
            const platformId = [];
            this.allPlatforms = [];
            this.allPlatformsInit.forEach(element => {
                this.allPlatforms.push(element);
            });
            data.Data.StrategyPlatforms.forEach(element => {
                platformId.push({Id: element.PlatformId, PlatformCode: element.Platform.PlatformCode});
                const index = this.allPlatforms.findIndex(o => o.PlatformCode == element.Platform.PlatformCode);
                if (index >= 0) {
                    this.allPlatforms.splice(index, 1);
                }
            });
            this.platforms = platformId;
            this.PlatformId.setValue(platformId);
            this.PlatformId.setValidators([Validators.required]);
            this.PlatformId.updateValueAndValidity();
            this.platformList.errorState = false;

            this.StrategyCreate = true;
            this.StrategyIndex = false;
        });
    }

    saveStrategy() {
        this.rest.checkDuplicate(this.global.getapiendpoint() + 'strategy/CheckDuplicateStrategy/', this.StrategyCode.value, (this.Id.value !== '' ? this.Id.value : '0')).subscribe((data: any) => {
            if (data.Data) {
                this.toastr.showNotification('top', 'right', data.Message, 'danger');
            } else {
                const platformId = [];
                if (this.PlatformId.value) {
                    this.PlatformId.value.forEach(element => {
                        platformId.push(element.Id);
                    });
                }
                const model: any = {
                    Id: this.Id.value,
                    StrategyCode: this.StrategyCode.value,
                    StrategyDesc: this.StrategyDesc.value,
                    LOBId: this.LOBId.value,
                    SubLOBId: this.SubLOBId.value,
                    PlatformId: platformId,
                    IsActive: this.IsActive.value,
                    UserId: this.userLoggedIn.Id,
                    UserRoleId: this.userLoggedIn.DefaultRoleId
                };
                let apiUrl = '';
                if (this.Id.value == '') {
                    apiUrl = 'strategy/CreateStrategy';
                } else {
                    apiUrl = 'strategy/UpdateStrategy';
                }
                this.rest.create(this.global.getapiendpoint() + apiUrl, model).subscribe((data: any) => {
                    this.toastr.showNotification('top', 'right', data.Message, 'success');
                    this.getAllStrategy();
                });
            }
        });
    }

    exportStrategy() {
        window.open(this.global.getapiendpoint() + 'strategy/Export', '_blank');
        this.toastr.showNotification('top', 'right', 'Strategy Master Exported Sucessfully', 'success');
    }

}
