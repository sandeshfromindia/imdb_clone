import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {RestService} from 'app/services/rest.service';
import {Global} from "app/common/global";
import {FormControl, Validators, FormBuilder, FormGroup} from "@angular/forms";
import {MatPaginator, MatTableDataSource, MatSort, MatDialog} from '@angular/material';
import {Toastr} from 'app/common/toastr';
import {Location} from '@angular/common';
import {Observable} from 'rxjs';
import {startWith, map} from 'rxjs/operators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {ElementRef} from '@angular/core';
import {MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete} from '@angular/material';
import {UserUploadDataComponent} from './user-upload-data/user-upload-data.component';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

    UserForm: FormGroup;
    UserIndex: boolean = false;
    UserCreate: boolean = false;
    users: any = [];
    displayedColumns: string[] = ['Id', 'LoginId', 'EmpCode', 'EmpName', 'LOBCode', 'SubLOBCode', 'ActivityCode', 'RoleCode', 'IsActive'];
    dataSource;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild('form') form;
    location: Location;
    UIObj: any;
    IsMaker: boolean;
    IsExport: boolean;
    userLoggedIn: any;
    Readonly = true;
    //LOB multiple dropdown
    separatorKeysCodes: number[] = [ENTER, COMMA];
    lobs: any = [];
    allLobs: any[] = [];
    allLobsInit: any[] = [];
    filteredLobs: Observable<any[]>;
    @ViewChild('lobInput') lobInput: ElementRef<HTMLInputElement>;
    @ViewChild('autoLob') autoLob: MatAutocomplete;
    @ViewChild('lobList') lobList;
    //SubLOB multiple dropdown
    sublobs: any = [];
    allSubLobs: any[] = [];
    allSubLobsInit: any[] = [];
    filteredSubLobs: Observable<any[]>;
    @ViewChild('sublobInput') sublobInput: ElementRef<HTMLInputElement>;
    @ViewChild('autoSubLob') autoSubLob: MatAutocomplete;
    @ViewChild('sublobList') sublobList;
    //Activity multiple dropdown
    activities: any = [];
    allActivities: any[] = [];
    allActivitiesInit: any[] = [];
    filteredActivities: Observable<any[]>;
    @ViewChild('activityInput') activityInput: ElementRef<HTMLInputElement>;
    @ViewChild('autoActivity') autoActivity: MatAutocomplete;
    @ViewChild('activityList') activityList;
    //Role multiple dropdown
    roles: any = [];
    allRoles: any[] = [];
    allRolesInit: any[] = [];
    filteredRoles: Observable<any[]>;
    @ViewChild('roleInput') roleInput: ElementRef<HTMLInputElement>;
    @ViewChild('autoRole') autoRole: MatAutocomplete;
    @ViewChild('roleList') roleList;

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
        this.UserForm = this.formBuilder.group({
            Id: [""],
            LOBId: [""],
            SubLOBId: [""],
            ActivityId: [""],
            RoleId: [""],
            ADUser: [""],
            SearchName: [""],
            LoginId: ["", [Validators.required, Validators.pattern("[a-zA-Z0-9_]*"), Validators.maxLength(100)]],
            EmpCode: [""],
            EmpName: ["", [Validators.required, Validators.pattern("[a-zA-Z ]*"), Validators.maxLength(100)]],
            EmailId: ["", [Validators.required, Validators.email, Validators.maxLength(100)]],
            Entity: ["", [Validators.required, Validators.pattern('[a-zA-Z0-9\\(\\)\\-&.\\\\,/_ ]*'), Validators.maxLength(100)]],
            LOB: [""],
            SubLOB: [""],
            Activity: [""],
            AllTerminalAccess: [""],
            TerminalMapping: [""],
            Role: [""],
            IsActive: [""],
        });
        this.getAllUser();
        this.getAllLOB();
        this.getAllActivity();
        this.getAllRole();
        this.SearchName.valueChanges.subscribe(text => {
            if (text != null && text != '') {
                this.users = [];
                this.getADUsers(text);
            } else {
                this.users = [];
            }
        });
        //LOB multiple dropdown
        this.filteredLobs = this.LOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterLobs(value) : this.allLobs.slice())
            );
        //SubLOB multiple dropdown
        this.filteredSubLobs = this.SubLOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterSubLobs(value) : this.allSubLobs.slice())
            );
        //Activity multiple dropdown
        this.filteredActivities = this.Activity.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterActivities(value) : this.allActivities.slice())
            );
        //Role multiple dropdown
        this.filteredRoles = this.Role.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterRoles(value) : this.allRoles.slice())
            );
        this.userLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn'));
    }

    get Id() {
        return this.UserForm.get('Id');
    }

    get LOBId() {
        return this.UserForm.get('LOBId');
    }

    get SubLOBId() {
        return this.UserForm.get('SubLOBId');
    }

    get ActivityId() {
        return this.UserForm.get('ActivityId');
    }

    get RoleId() {
        return this.UserForm.get('RoleId');
    }

    get ADUser() {
        return this.UserForm.get('ADUser');
    }

    get SearchName() {
        return this.UserForm.get('SearchName');
    }

    get LoginId() {
        return this.UserForm.get('LoginId');
    }

    get EmpCode() {
        return this.UserForm.get('EmpCode');
    }

    get EmpName() {
        return this.UserForm.get('EmpName');
    }

    get EmailId() {
        return this.UserForm.get('EmailId');
    }

    get Entity() {
        return this.UserForm.get('Entity');
    }

    get LOB() {
        return this.UserForm.get('LOB');
    }

    get SubLOB() {
        return this.UserForm.get('SubLOB');
    }

    get Activity() {
        return this.UserForm.get('Activity');
    }

    get AllTerminalAccess() {
        return this.UserForm.get('AllTerminalAccess');
    }

    get TerminalMapping() {
        return this.UserForm.get('TerminalMapping');
    }

    get Role() {
        return this.UserForm.get('Role');
    }

    get IsActive() {
        return this.UserForm.get('IsActive');
    }

    getAllUser() {
        this.rest.getAll(this.global.getapiendpoint() + "user/GetAllUser").subscribe((data: any) => {
            let tabledata = [];
            data.Data.forEach(element => {
                var lobcode = '';
                element.UserLOBs.forEach(lobelement => {
                    lobcode += ", " + lobelement.LOB.LOBCode;
                });
                lobcode = lobcode.substr(2, lobcode.length);
                var sublobcode = '';
                element.UserSubLOBs.forEach(sublobelement => {
                    sublobcode += ", " + sublobelement.SubLOB.SubLOBCode;
                });
                sublobcode = sublobcode.substr(2, sublobcode.length);
                var activitycode = '';
                element.UserActivities.forEach(activityelement => {
                    activitycode += ", " + activityelement.Activity.ActivityCode;
                });
                activitycode = activitycode.substr(2, activitycode.length);
                var rolecode = '';
                element.UserRoles.forEach(roleelement => {
                    rolecode += ", " + roleelement.Role.RoleCode;
                });
                rolecode = rolecode.substr(2, rolecode.length);
                tabledata.push({
                    Id: element.Id,
                    LoginId: element.LoginId,
                    EmpCode: element.EmpCode,
                    EmpName: element.EmpName,
                    LOBCode: lobcode,
                    SubLOBCode: sublobcode,
                    ActivityCode: activitycode,
                    RoleCode: rolecode,
                    IsActive: element.IsActive
                });
            });
            this.dataSource = new MatTableDataSource(tabledata);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        });
        this.UserCreate = false;
        this.UserIndex = true;
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    getAllLOB() {
        this.allLobsInit = [];
        this.rest.getAll(this.global.getapiendpoint() + "lob/GetAllActiveLOB").subscribe((data: any) => {
            this.allLobsInit = data.Data;
        });
    }

    getAllSubLOB(LOBId: any) {
        this.allSubLobsInit = [];
        this.rest.getAll(this.global.getapiendpoint() + "sublob/GetSubLOBByLOBId/".concat(LOBId)).subscribe((data: any) => {
            this.allSubLobsInit = data.Data;

            this.sublobs = [];
            this.allSubLobs = [];
            this.allSubLobsInit.forEach(element => {
                this.allSubLobs.push(element);
            });
            this.SubLOB.setValue("");
            this.filteredSubLobs = this.SubLOB.valueChanges
                .pipe(
                    startWith(null),
                    map((value: any | null) => value ? this._filterSubLobs(value) : this.allSubLobs.slice())
                );
        });
    }

    getAllSubLOBEdit(LOBId: any, UserSubLOBs: any) {
        this.allSubLobsInit = [];
        this.rest.getAll(this.global.getapiendpoint() + "sublob/GetSubLOBByLOBId/".concat(LOBId)).subscribe((data: any) => {
            this.allSubLobsInit = data.Data;

            var sublobId = [];
            this.allSubLobs = [];
            this.allSubLobsInit.forEach(element => {
                this.allSubLobs.push(element);
            });
            UserSubLOBs.forEach(element => {
                sublobId.push({Id: element.SubLOBId, SubLOBCode: element.SubLOB.SubLOBCode});
                const index = this.allSubLobs.findIndex(o => o.SubLOBCode == element.SubLOB.SubLOBCode);
                if (index >= 0) {
                    this.allSubLobs.splice(index, 1);
                }
            });
            this.sublobs = sublobId;
            this.SubLOBId.setValue(sublobId);
            this.filteredSubLobs = this.SubLOB.valueChanges
                .pipe(
                    startWith(null),
                    map((value: any | null) => value ? this._filterSubLobs(value) : this.allSubLobs.slice())
                );
        });
    }

    getAllActivity() {
        this.allActivitiesInit = [];
        this.rest.getAll(this.global.getapiendpoint() + "activity/GetAllActiveActivity").subscribe((data: any) => {
            this.allActivitiesInit = data.Data;
        });
    }

    getAllRole() {
        this.allRolesInit = [];
        this.rest.getAll(this.global.getapiendpoint() + "role/GetAllActiveRole").subscribe((data: any) => {
            this.allRolesInit = data.Data;
        });
    }

    getADUsers(Text: string) {
        this.rest.getAll(this.global.getapiendpoint() + "ad/FindUsers/".concat(Text)).subscribe((data: any) => {
            this.users = data.Data;
        });
    }

    onADUserChange(value) {
        if (!this.ADUser.value) {
            this.EmpCode.setValidators([Validators.pattern("[a-zA-Z0-9 ]*"), Validators.maxLength(100)]);
            this.EmpCode.updateValueAndValidity();
            this.Readonly = false;
            this.SearchName.setValue('');
            this.EmpCode.setValue('');
        } else {
            this.EmpCode.setValidators([Validators.required, Validators.pattern("[a-zA-Z0-9 ]*"), Validators.maxLength(100)]);
            this.EmpCode.updateValueAndValidity();
            this.EmpCode.markAsUntouched();
            this.Readonly = true;
        }
    }

    getEmpCodeErrorMessage() {
        return this.EmpCode.hasError('required') ? 'Employee Code is required' :
            this.EmpCode.hasError('pattern') ? 'Please enter a valid Employee Code' :
                this.EmpCode.hasError('maxlength') ? 'This field should have less than 100 characters' :
                    '';
    }

    inputUser(user: any) {
        this.LoginId.setValue("");
    }

    selectedUser(user: any): void {
        this.SearchName.setValue(user.cn);
        this.LoginId.setValue(user.sAMAccountName);
        this.EmpCode.setValue(user.description);
        this.EmpName.setValue(user.cn);
        this.EmailId.setValue(user.mail);
        this.Entity.setValue(user.company);
    }

    //LOB multiple dropdown
    addLOB(event: MatChipInputEvent): void {
        if (!this.autoLob.isOpen) {
            const input = event.input;
            if (input) {
                input.value = '';
            }
            this.LOB.setValue(null);
        }
        if (this.lobs.length == 0) {
            this.lobList.errorState = true;
        } else {
            this.lobList.errorState = false;
        }
    }

    removeLOB(platform: any): void {
        const index = this.lobs.indexOf(platform);
        if (index >= 0) {
            this.lobs.splice(index, 1);
        }
        if (this.lobs.length == 0) {
            this.LOBId.setValue("");
        }
        this.allLobs.push(platform);
        this.filteredLobs = this.LOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterLobs(value) : this.allLobs.slice())
            );
        if (this.lobs.length == 0) {
            this.lobList.errorState = true;
        } else {
            this.lobList.errorState = false;

            var lobId = [];
            this.lobs.forEach(element => {
                lobId.push(element.Id);
            });
            this.getAllSubLOB(lobId);
        }
    }

    selectedLOB(event: MatAutocompleteSelectedEvent): void {
        this.lobs.push(event.option.value);
        this.lobInput.nativeElement.value = '';
        this.LOB.setValue(null);
        this.LOBId.setValue(this.lobs);
        const index = this.allLobs.indexOf(event.option.value);
        if (index >= 0) {
            this.allLobs.splice(index, 1);
        }
        this.filteredLobs = this.LOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterLobs(value) : this.allLobs.slice())
            );
        if (this.lobs.length == 0) {
            this.lobList.errorState = true;
        } else {
            this.lobList.errorState = false;

            var lobId = [];
            this.lobs.forEach(element => {
                lobId.push(element.Id);
            });
            this.getAllSubLOB(lobId);
        }
    }

    private _filterLobs(value: any): any[] {
        const filterValue = (value ? (value.LOBCode ? value.LOBCode.toLowerCase() : value.toLowerCase()) : "");
        return this.allLobs.filter(o => o.LOBCode.toLowerCase().includes(filterValue));
    }

    //LOB multiple dropdown

    //SubLOB multiple dropdown
    addSubLOB(event: MatChipInputEvent): void {
        if (!this.autoSubLob.isOpen) {
            const input = event.input;
            if (input) {
                input.value = '';
            }
            this.SubLOB.setValue(null);
        }
        if (this.sublobs.length == 0) {
            this.sublobList.errorState = true;
        } else {
            this.sublobList.errorState = false;
        }
    }

    removeSubLOB(platform: any): void {
        const index = this.sublobs.indexOf(platform);
        if (index >= 0) {
            this.sublobs.splice(index, 1);
        }
        if (this.sublobs.length == 0) {
            this.SubLOBId.setValue("");
        }
        this.allSubLobs.push(platform);
        this.filteredSubLobs = this.SubLOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterSubLobs(value) : this.allSubLobs.slice())
            );
        if (this.sublobs.length == 0) {
            this.sublobList.errorState = true;
        } else {
            this.sublobList.errorState = false;
        }
    }

    selectedSubLOB(event: MatAutocompleteSelectedEvent): void {
        this.sublobs.push(event.option.value);
        this.sublobInput.nativeElement.value = '';
        this.SubLOB.setValue(null);
        this.SubLOBId.setValue(this.sublobs);
        const index = this.allSubLobs.indexOf(event.option.value);
        if (index >= 0) {
            this.allSubLobs.splice(index, 1);
        }
        this.filteredSubLobs = this.SubLOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterSubLobs(value) : this.allSubLobs.slice())
            );
        if (this.sublobs.length == 0) {
            this.sublobList.errorState = true;
        } else {
            this.sublobList.errorState = false;
        }
    }

    private _filterSubLobs(value: any): any[] {
        const filterValue = (value ? (value.SubLOBCode ? value.SubLOBCode.toLowerCase() : value.toLowerCase()) : "");
        return this.allSubLobs.filter(o => o.SubLOBCode.toLowerCase().includes(filterValue));
    }

    //SubLOB multiple dropdown

    //Activity multiple dropdown
    addActivity(event: MatChipInputEvent): void {
        if (!this.autoActivity.isOpen) {
            const input = event.input;
            if (input) {
                input.value = '';
            }
            this.Activity.setValue(null);
        }
    }

    removeActivity(platform: any): void {
        const index = this.activities.indexOf(platform);
        if (index >= 0) {
            this.activities.splice(index, 1);
        }
        if (this.activities.length == 0) {
            this.ActivityId.setValue("");
        }
        this.allActivities.push(platform);
        this.filteredActivities = this.Activity.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterActivities(value) : this.allActivities.slice())
            );
    }

    selectedActivity(event: MatAutocompleteSelectedEvent): void {
        this.activities.push(event.option.value);
        this.activityInput.nativeElement.value = '';
        this.Activity.setValue(null);
        this.ActivityId.setValue(this.activities);
        const index = this.allActivities.indexOf(event.option.value);
        if (index >= 0) {
            this.allActivities.splice(index, 1);
        }
        this.filteredActivities = this.Activity.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterActivities(value) : this.allActivities.slice())
            );
    }

    private _filterActivities(value: any): any[] {
        const filterValue = (value ? (value.ActivityCode ? value.ActivityCode.toLowerCase() : value.toLowerCase()) : "");
        return this.allActivities.filter(o => o.ActivityCode.toLowerCase().includes(filterValue));
    }

    //Activity multiple dropdown

    //Role multiple dropdown
    addRole(event: MatChipInputEvent): void {
        if (!this.autoRole.isOpen) {
            const input = event.input;
            if (input) {
                input.value = '';
            }
            this.Role.setValue(null);
        }
        if (this.roles.length == 0) {
            this.roleList.errorState = true;
        } else {
            this.roleList.errorState = false;
        }
    }

    removeRole(platform: any): void {
        const index = this.roles.indexOf(platform);
        if (index >= 0) {
            this.roles.splice(index, 1);
        }
        if (this.roles.length == 0) {
            this.RoleId.setValue("");
        }
        this.allRoles.push(platform);
        this.filteredRoles = this.Role.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterRoles(value) : this.allRoles.slice())
            );
        if (this.roles.length == 0) {
            this.roleList.errorState = true;
        } else {
            this.roleList.errorState = false;
        }
    }

    selectedRole(event: MatAutocompleteSelectedEvent): void {
        this.roles.push(event.option.value);
        this.roleInput.nativeElement.value = '';
        this.Role.setValue(null);
        this.RoleId.setValue(this.roles);
        const index = this.allRoles.indexOf(event.option.value);
        if (index >= 0) {
            this.allRoles.splice(index, 1);
        }
        this.filteredRoles = this.Role.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterRoles(value) : this.allRoles.slice())
            );
        if (this.roles.length == 0) {
            this.roleList.errorState = true;
        } else {
            this.roleList.errorState = false;
        }
    }

    private _filterRoles(value: any): any[] {
        const filterValue = (value ? (value.RoleCode ? value.RoleCode.toLowerCase() : value.toLowerCase()) : "");
        return this.allRoles.filter(o => o.RoleCode.toLowerCase().includes(filterValue));
    }

    //Role multiple dropdown

    uploadUser() {
        const dialogRef = this.dialog.open(UserUploadDataComponent, {});
        dialogRef
            .afterClosed()
            .subscribe(() => {
                this.getAllUser();
            });
    }

    addUser() {
        this.form.resetForm();
        this.UserForm.markAsUntouched();
        this.Id.setValue("");
        this.ADUser.setValue(true);
        this.IsActive.setValue(true);
        this.onADUserChange(this.ADUser);
        //LOB multiple dropdown
        this.LOBId.setValue("");
        this.LOBId.setValidators([Validators.required]);
        this.LOBId.updateValueAndValidity();
        this.lobs = [];
        this.allLobs = [];
        this.allLobsInit.forEach(element => {
            this.allLobs.push(element);
        });
        this.LOB.setValue("");
        this.filteredLobs = this.LOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterLobs(value) : this.allLobs.slice())
            );
        this.lobList.errorState = true;
        //SubLOB multiple dropdown
        this.SubLOBId.setValue("");
        this.SubLOBId.setValidators([Validators.required]);
        this.SubLOBId.updateValueAndValidity();
        this.sublobs = [];
        this.allSubLobs = [];
        this.allSubLobsInit.forEach(element => {
            this.allSubLobs.push(element);
        });
        this.SubLOB.setValue("");
        this.filteredSubLobs = this.SubLOB.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterSubLobs(value) : this.allSubLobs.slice())
            );
        this.sublobList.errorState = true;
        //Activity multiple dropdown
        this.ActivityId.setValue("");
        this.activities = [];
        this.allActivities = [];
        this.allActivitiesInit.forEach(element => {
            this.allActivities.push(element);
        });
        this.Activity.setValue("");
        this.filteredActivities = this.Activity.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterActivities(value) : this.allActivities.slice())
            );
        //Role multiple dropdown
        this.RoleId.setValue("");
        this.RoleId.setValidators([Validators.required]);
        this.RoleId.updateValueAndValidity();
        this.roles = [];
        this.allRoles = [];
        this.allRolesInit.forEach(element => {
            this.allRoles.push(element);
        });
        this.Role.setValue("");
        this.filteredRoles = this.Role.valueChanges
            .pipe(
                startWith(null),
                map((value: any | null) => value ? this._filterRoles(value) : this.allRoles.slice())
            );
        this.roleList.errorState = true;

        this.UserCreate = true;
        this.UserIndex = false;
    }

    backUser() {
        this.UserCreate = false;
        this.UserIndex = true;
    }

    editUser(Id: string) {
        this.rest.getById(this.global.getapiendpoint() + "user/GetUserById/", Id).subscribe((data: any) => {
            this.Id.setValue(data.Data.Id);
            this.ADUser.setValue(data.Data.ADUser);
            this.LoginId.setValue(data.Data.LoginId);
            this.EmpCode.setValue(data.Data.EmpCode);
            this.EmpName.setValue(data.Data.EmpName);
            this.EmailId.setValue(data.Data.EmailId);
            this.Entity.setValue(data.Data.Entity);
            this.LOBId.setValue(data.Data.LOBId);
            this.SubLOBId.setValue(data.Data.SubLOBId);
            this.ActivityId.setValue(data.Data.ActivityId);
            this.AllTerminalAccess.setValue(data.Data.AllTerminalAccess);
            this.TerminalMapping.setValue(data.Data.TerminalMapping);
            this.IsActive.setValue(data.Data.IsActive);
            this.onADUserChange(this.ADUser);
            //LOB multiple dropdown
            var lobId = [];
            this.allLobs = [];
            this.allLobsInit.forEach(element => {
                this.allLobs.push(element);
            });
            data.Data.UserLOBs.forEach(element => {
                lobId.push({Id: element.LOBId, LOBCode: element.LOB.LOBCode});
                const index = this.allLobs.findIndex(o => o.LOBCode == element.LOB.LOBCode);
                if (index >= 0) {
                    this.allLobs.splice(index, 1);
                }
            });
            this.lobs = lobId;
            this.LOBId.setValue(lobId);
            this.LOBId.setValidators([Validators.required]);
            this.LOBId.updateValueAndValidity();
            this.filteredLobs = this.LOB.valueChanges
                .pipe(
                    startWith(null),
                    map((value: any | null) => value ? this._filterLobs(value) : this.allLobs.slice())
                );
            this.lobList.errorState = false;
            //SubLOB multiple dropdown
            var lobId = [];
            this.lobs.forEach(element => {
                lobId.push(element.Id);
            });
            this.SubLOBId.setValidators([Validators.required]);
            this.SubLOBId.updateValueAndValidity();
            this.getAllSubLOBEdit(lobId, data.Data.UserSubLOBs);
            this.sublobList.errorState = false;
            //Activity multiple dropdown
            var activityId = [];
            this.allActivities = [];
            this.allActivitiesInit.forEach(element => {
                this.allActivities.push(element);
            });
            data.Data.UserActivities.forEach(element => {
                activityId.push({Id: element.ActivityId, ActivityCode: element.Activity.ActivityCode});
                const index = this.allActivities.findIndex(o => o.ActivityCode == element.Activity.ActivityCode);
                if (index >= 0) {
                    this.allActivities.splice(index, 1);
                }
            });
            this.activities = activityId;
            this.ActivityId.setValue(activityId);
            this.filteredActivities = this.Activity.valueChanges
                .pipe(
                    startWith(null),
                    map((value: any | null) => value ? this._filterActivities(value) : this.allActivities.slice())
                );
            //Role multiple dropdown
            var roleId = [];
            this.allRoles = [];
            this.allRolesInit.forEach(element => {
                this.allRoles.push(element);
            });
            data.Data.UserRoles.forEach(element => {
                roleId.push({Id: element.RoleId, RoleCode: element.Role.RoleCode});
                const index = this.allRoles.findIndex(o => o.RoleCode == element.Role.RoleCode);
                if (index >= 0) {
                    this.allRoles.splice(index, 1);
                }
            });
            this.roles = roleId;
            this.RoleId.setValue(roleId);
            this.RoleId.setValidators([Validators.required]);
            this.RoleId.updateValueAndValidity();
            this.filteredRoles = this.Role.valueChanges
                .pipe(
                    startWith(null),
                    map((value: any | null) => value ? this._filterRoles(value) : this.allRoles.slice())
                );
            this.roleList.errorState = false;

            this.UserCreate = true;
            this.UserIndex = false;
        });
    }

    saveUser() {
        this.rest.checkDuplicate(this.global.getapiendpoint() + 'user/CheckDuplicateUser/', this.LoginId.value, (this.Id.value !== '' ? this.Id.value : '0')).subscribe((data: any) => {
            if (data.Data) {
                this.toastr.showNotification('top', 'right', data.Message, 'danger');
            } else {
                var lobId = [];
                if (this.LOBId.value) {
                    this.LOBId.value.forEach(element => {
                        lobId.push(element.Id);
                    });
                }
                var sublobId = [];
                if (this.SubLOBId.value) {
                    this.SubLOBId.value.forEach(element => {
                        sublobId.push(element.Id);
                    });
                }
                var activityId = [];
                if (this.ActivityId.value) {
                    this.ActivityId.value.forEach(element => {
                        activityId.push(element.Id);
                    });
                }
                var roleId = [];
                if (this.RoleId.value) {
                    this.RoleId.value.forEach(element => {
                        roleId.push(element.Id);
                    });
                }
                var model: any = {
                    Id: this.Id.value,
                    ADUser: this.ADUser.value,
                    LoginId: this.LoginId.value,
                    EmpCode: this.EmpCode.value,
                    EmpName: this.EmpName.value,
                    EmailId: this.EmailId.value,
                    Entity: this.Entity.value,
                    AllTerminalAccess: this.AllTerminalAccess.value,
                    TerminalMapping: this.TerminalMapping.value,
                    DefaultRoleId: roleId ? roleId[0] : "",
                    IsActive: this.IsActive.value,
                    LOBId: lobId,
                    SubLOBId: sublobId,
                    ActivityId: activityId,
                    RoleId: roleId,
                    UserId: this.userLoggedIn.Id,
                    UserRoleId: this.userLoggedIn.DefaultRoleId
                };
                var apiUrl = "";
                if (this.Id.value == "") {
                    apiUrl = "user/CreateUser";
                } else {
                    apiUrl = "user/UpdateUser";
                }
                this.rest.create(this.global.getapiendpoint() + apiUrl, model).subscribe((data: any) => {
                    this.toastr.showNotification('top', 'right', data.Message, 'success');
                    this.getAllUser();
                });
            }
        });
    }

    exportUser() {
        window.open(this.global.getapiendpoint() + 'user/Export', '_blank');
        this.toastr.showNotification('top', 'right', 'User Master Exported Sucessfully', 'success');
    }

}
