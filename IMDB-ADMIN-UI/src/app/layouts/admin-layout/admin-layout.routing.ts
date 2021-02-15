import {Routes} from '@angular/router';

import {AuthGuard} from 'app/common/auth.guard';
import {UserComponent} from 'app/usermanagement/user/user.component';
import {RoleComponent} from 'app/usermanagement/role/role.component';
import {UIRoleConfigurationComponent} from 'app/usermanagement/ui-role-configuration/ui-role-configuration.component';
import {SubLOBComponent} from 'app/master/sub-lob/sub-lob.component';
import {ServerComponent} from 'app/master/server/server.component';
import {StrategyComponent} from 'app/master/strategy/strategy.component';

export const AdminLayoutRoutes: Routes = [
    {path: 'user', component: UserComponent, canActivate: [AuthGuard]},
    {path: 'movies', component: RoleComponent, canActivate: [AuthGuard]},
    {path: 'sublob', component: SubLOBComponent, canActivate: [AuthGuard]},
    {path: 'uiroleconfig', component: UIRoleConfigurationComponent, canActivate: [AuthGuard]},
    {path: 'server', component: ServerComponent, canActivate: [AuthGuard]},
    {path: 'strategy', component: StrategyComponent, canActivate: [AuthGuard]},
];
