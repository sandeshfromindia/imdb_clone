import {FormControl} from '@angular/forms';

import * as _moment from 'moment';

const moment = _moment;

export class DateValidator {

    static ValidateDate(control: FormControl) {

        if (!moment(control.value, 'DD/MM/YYYY', true).isValid()) {
            return {invalidDate: true};
        }

        return {invalidDate: false};

    }

}
