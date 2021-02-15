import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

import {
    MatButtonModule,
    MatInputModule,
    MatRippleModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatIconModule,
    MatDialog,
    MatDialogModule,
    MatListModule,
    MatProgressBarModule
} from '@angular/material';

import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatChipsModule} from '@angular/material/chips';
import {DragDropModule} from '@angular/cdk/drag-drop';

import {AdminLayoutRoutes} from 'app/layouts/admin-layout/admin-layout.routing';
import {UserComponent} from 'app/usermanagement/user/user.component';
import {RoleComponent} from 'app/usermanagement/role/role.component';
import {UIRoleConfigurationComponent} from 'app/usermanagement/ui-role-configuration/ui-role-configuration.component';
import {SubLOBComponent} from 'app/master/sub-lob/sub-lob.component';
import {RoleUploadDataComponent} from 'app/usermanagement/role/role-upload-data/role-upload-data.component';
import {SublobUploadDataComponent} from 'app/master/sub-lob/sublob-upload-data/sublob-upload-data.component';
import {ServerComponent} from 'app/master/server/server.component';
import {ServerUploadDataComponent} from 'app/master/server/server-upload-data/server-upload-data.component';
import {UserUploadDataComponent} from 'app/usermanagement/user/user-upload-data/user-upload-data.component';
import {StrategyComponent} from 'app/master/strategy/strategy.component';
import {StrategyUploadDataComponent} from 'app/master/strategy/strategy-upload-data/strategy-upload-data.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AdminLayoutRoutes),
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatRippleModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatAutocompleteModule,
        MatSortModule,
        MatTableModule,
        MatPaginatorModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMomentDateModule,
        MatSlideToggleModule,
        MatTabsModule,
        MatIconModule,
        MatDialogModule,
        MatExpansionModule,
        MatListModule,
        MatProgressBarModule,
        HttpClientModule,
        MatChipsModule,
        DragDropModule,
    ],
    declarations: [
        UserComponent,
        RoleComponent,
        SubLOBComponent,
        UIRoleConfigurationComponent,
        RoleUploadDataComponent,
        SublobUploadDataComponent,
        ServerComponent,
        ServerUploadDataComponent,
        UserUploadDataComponent,
        StrategyComponent,
        StrategyUploadDataComponent
    ],
    exports: [
        RoleUploadDataComponent,
        SublobUploadDataComponent,
        ServerUploadDataComponent,
        UserUploadDataComponent,
        StrategyUploadDataComponent,
    ],
    entryComponents: [
        RoleUploadDataComponent,
        SublobUploadDataComponent,
        ServerUploadDataComponent,
        UserUploadDataComponent,
        StrategyUploadDataComponent,
    ],
})

export class AdminLayoutModule {
}
