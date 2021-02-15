import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {Routes, RouterModule} from '@angular/router';

import {AdminLayoutComponent} from 'app/layouts/admin-layout/admin-layout.component';
import {LoginLayoutComponent} from 'app/layouts/login-layout/login-layout.component';
import {LoginComponent} from 'app/login/login.component';
import {AuthGuard} from 'app/common/auth.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
    },
    {
        path: '',
        component: LoginLayoutComponent,
        children: [
            {path: '', component: LoginComponent, pathMatch: 'full'},
            {path: 'login', component: LoginComponent}
        ]
    },
    {
        path: '',
        component: AdminLayoutComponent,
        children: [
            {
                path: '',
                loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
            }],
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        RouterModule.forRoot(routes)
    ],
    exports: [],
})
export class AppRoutingModule {
}
