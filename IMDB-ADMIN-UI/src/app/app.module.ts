import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from 'app/app.routing';
import {ComponentsModule} from 'app/components/components.module';
import {HttpClientModule} from '@angular/common/http';
import {AngularFontAwesomeModule} from 'angular-font-awesome';
import {MatInputModule, MatButtonModule, MatIconModule, MatDialogModule} from '@angular/material';

import {AppComponent} from 'app/app.component';
import {AdminLayoutComponent} from 'app/layouts/admin-layout/admin-layout.component';
import {LoginComponent} from 'app/login/login.component';
import {LoginLayoutComponent} from 'app/layouts/login-layout/login-layout.component';
import {AuthGuard} from 'app/common/auth.guard';
import {ForgotPasswordDialogComponent} from 'app/login/forgot-password-dialog/forgot-password-dialog.component';

@NgModule({
    imports: [
        BrowserAnimationsModule,
        FormsModule,
        HttpModule,
        ComponentsModule,
        RouterModule,
        AppRoutingModule,
        HttpClientModule,
        AngularFontAwesomeModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
    ],
    declarations: [
        AppComponent,
        AdminLayoutComponent,
        LoginComponent,
        LoginLayoutComponent,
        ForgotPasswordDialogComponent,
    ],
    exports: [ForgotPasswordDialogComponent],
    entryComponents: [ForgotPasswordDialogComponent],
    providers: [AuthGuard],
    bootstrap: [AppComponent]
})
export class AppModule {
}
