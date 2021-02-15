import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RestService} from 'app/services/rest.service';
import {Global} from 'app/common/global';
import {FormControl, Validators, FormBuilder, FormGroup, FormArray, AbstractControl} from '@angular/forms';
import {MatPaginator, MatTableDataSource, MatSort} from '@angular/material';
import {Toastr} from 'app/common/toastr';
import {BehaviorSubject} from 'rxjs';

export interface GridRowObject {
    UIId: number;
    UI: string;
    ParentId: string;
    Viewer: boolean;
    Maker: boolean;
    Checker: boolean;
    Requester: boolean,
    Export: boolean;
    Delete: boolean,
    Upload: boolean,
}

@Component({
    selector: 'app-ui-role-configuration',
    templateUrl: './ui-role-configuration.component.html',
    styleUrls: ['./ui-role-configuration.component.scss']
})
export class UIRoleConfigurationComponent implements OnInit {

    @ViewChild('form') form;
    uiRoleMapStatus: string = 'create';
    menuItems: any[];
    roleList: any[];
    JSON: any;
    displayedColumns = ['RoleId', 'Viewer', 'Maker', 'Checker', 'Requester', 'Export', 'Delete', 'Upload'];
    UIRoleMapData: GridRowObject[];
    UIRoleMapDataSource = new MatTableDataSource(this.UIRoleMapData);
    dataSource = new BehaviorSubject<AbstractControl[]>([]);
    rows: FormArray = this.formBuilder.array([]);
    UIRoleConfigForm: FormGroup = this.formBuilder.group({
        RoleId: ['', [Validators.required]],
        'UIRoleMap': this.rows
    });
    UserLoggedIn: any;

    constructor(private formBuilder: FormBuilder, private rest: RestService, private route: ActivatedRoute, private router: Router, private global: Global, private toastr: Toastr) {
        this.JSON = JSON;
    }

    ngOnInit() {
        this.UserLoggedIn = JSON.parse(localStorage.getItem("userLoggedIn"));
        this.getMenuList();
        this.getRoleList();
        this.UIRoleMapData = [];
        this.UIRoleMapData.forEach((d: GridRowObject) => this.addRow(d, false));
        this.updateView();
    }

    emptyTable() {
        while (this.rows.length !== 0) {
            this.rows.removeAt(0);
        }
    }

    onEdit(row) {
        console.log(row);
    }

    addRow(d?: GridRowObject, noUpdate?: boolean) {
        var uiTitle = this.menuItems.find(x => x.Id == d.UIId);
        uiTitle = uiTitle ? uiTitle.Title : '';
        const row = this.formBuilder.group({
            'UIId': [d && d.UIId ? d.UIId : null, []],
            'UI': [d && uiTitle ? uiTitle : null, []],
            'ParentId': [d && d.ParentId ? d.ParentId : '0', []],
            'Viewer': [d && d.Viewer ? d.Viewer : false, []],
            'Maker': [d && d.Maker ? d.Maker : false, []],
            'Checker': [d && d.Checker ? d.Checker : false, []],
            'Requester': [d && d.Requester ? d.Requester : false, []],
            'Export': [d && d.Export ? d.Export : false, []],
            'Delete': [d && d.Delete ? d.Delete : false, []],
            'Upload': [d && d.Upload ? d.Upload : false, []],
        });
        this.rows.push(row);
        if (!noUpdate) {
            this.updateView();
        }
    }

    updateView() {
        this.dataSource.next(this.rows.controls);
    }

    clearView() {
        this.UIRoleMapData = [];
        this.dataSource.next(this.rows.controls);
    }

    get UIMenuId() {
        return this.UIRoleConfigForm.get('UIMenuId');
    }

    get RoleId() {
        return this.UIRoleConfigForm.get('RoleId');
    }

    getMenuList() {
        this.menuItems = [];
        this.rest.getAll(this.global.getapiendpoint() + 'menu/GetAllActiveMenu/').subscribe((data: any) => {
            this.menuItems = data.Data;
        });
    }

    getRoleList() {
        this.roleList = [];
        this.rest.getAll(this.global.getapiendpoint() + 'role/GetAllActiveRole').subscribe((data: any) => {
            this.roleList = data.Data;
        });
    }

    saveUIRoleConfig() {
        const UIRoleMap = this.UIRoleConfigForm.get('UIRoleMap').value;
        const model: any = {
            RoleId: this.RoleId.value,
            UIRoleMap: JSON.stringify(UIRoleMap),
            UserId: this.UserLoggedIn.Id,
            UserRoleId: this.UserLoggedIn.DefaultRoleId
        }
        this.rest.create(this.global.getapiendpoint() + 'uirolemap/CreateUIRoleMap', model).subscribe((data: any) => {
            this.toastr.showNotification('top', 'right', 'Mapping Succefully Added', 'success');
            this.emptyTable();
            this.updateView();
            this.UIRoleConfigForm.reset();
            this.form.resetForm();
            this.UIRoleConfigForm.markAsUntouched();
        });
    }

    loadUIRoleMapping(roleId) {
        this.emptyTable();
        this.updateView();
        this.rest.getById(this.global.getapiendpoint() + 'uirolemap/GetUIRoleMap/', roleId).subscribe((data: any) => {
            if (data.Success == true) {
                if (data.Data.length !== 0) {
                    this.uiRoleMapStatus = 'update';
                    this.UIRoleMapData = data.Data;
                    // this.UIRoleMapData.forEach((d: GridRowObject) => this.addRow(d, true));
                    this.menuItems.forEach((menu) => {
                        // const found = this.UIRoleMapData.some(el => el.UIId === menu.Id);
                        const UIRoleMap = this.UIRoleMapData.find(el => el.UIId === menu.Id);
                        if (UIRoleMap) {
                            this.addRow({
                                UIId: menu.Id,
                                UI: menu.Title,
                                ParentId: menu.ParentId,
                                Viewer: UIRoleMap.Viewer,
                                Maker: UIRoleMap.Maker,
                                Checker: UIRoleMap.Checker,
                                Requester: UIRoleMap.Requester,
                                Export: UIRoleMap.Export,
                                Delete: UIRoleMap.Delete,
                                Upload: UIRoleMap.Upload,
                            }, false);
                        } else {
                            this.addRow({
                                UIId: menu.Id,
                                UI: menu.Title,
                                ParentId: menu.ParentId,
                                Viewer: false,
                                Maker: false,
                                Checker: false,
                                Requester: false,
                                Export: false,
                                Delete: false,
                                Upload: false,
                            }, false);
                        }
                    })
                    this.updateView();
                } else {
                    this.setDefaultData();
                    this.updateView();
                    this.uiRoleMapStatus = 'create';
                }
            } else {
                console.error(data);
            }
        });
    }

    setDefaultData() {
        const menu_list = this.menuItems;
        menu_list.forEach((d) => {
            this.addRow({
                UIId: d.Id,
                UI: d.Title,
                ParentId: d.ParentId,
                Viewer: false,
                Maker: false,
                Checker: false,
                Requester: false,
                Export: false,
                Delete: false,
                Upload: false,
            }, false)
        });
        this.updateView();
    }

}
