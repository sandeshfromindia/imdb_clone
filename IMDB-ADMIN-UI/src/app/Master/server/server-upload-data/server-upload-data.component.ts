import {Component, OnInit, ViewChild} from '@angular/core';
import {MatDialogRef, MatPaginator, MatTableDataSource} from '@angular/material';
import {Router} from '@angular/router';
import {ServerUploadDataService} from '../server-upload-data.service';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {Toastr} from 'app/common/toastr';

const headers = [{
    'ServerCode': 'Server Code',
    'ServerDesc': 'Server Desc',
    'ServerIP': '00.000.0.000',
    'AutoUploaderStatus': 'No',
    'FileUploaderPath': 'File Uploader Path',
    'ReconExclusion': 'No',
    'MaxUserLimit': '10',
}];

@Component({
    selector: 'app-server-upload-data',
    templateUrl: './server-upload-data.component.html',
    styleUrls: ['./server-upload-data.component.scss']
})

export class ServerUploadDataComponent implements OnInit {

    @ViewChild('file') file;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    public files: Set<File> = new Set();
    progress;
    validateSuccessful = false;
    errorFlag = false;
    uploadData: any;
    columns: any;
    dataSource: any;
    private UserLoggedIn: any;

    constructor(
        private router: Router,
        public dialogRef: MatDialogRef<ServerUploadDataComponent>,
        public ServerUploadDataService: ServerUploadDataService,
        private toastr: Toastr,
    ) {
    }

    ngOnInit() {
        this.UserLoggedIn = JSON.parse(localStorage.getItem('userLoggedIn'));
    }

    onFilesAdded() {
        const files: { [key: string]: File } = this.file.nativeElement.files;
        this.validateSuccessful = false;
        for (const key in files) {
            if (!isNaN(parseInt(key))) {
                this.files.clear();
                this.files.add(files[key]);
            }
        }
    }

    addFiles() {
        this.file.nativeElement.click();
    }

    validate() {

        if (!this.files.size) {
            this.toastr.showNotification('top', 'right', 'Please select file for validate', 'danger');
            return false;
        }

        this.progress = this.ServerUploadDataService.validateFile(this.files);
        const allProgressObservables = [];
        for (const key in this.progress) {
            if (this.progress.hasOwnProperty(key)) {
                allProgressObservables.push(this.progress[key].progress);
                allProgressObservables.push(this.progress[key].error);
                this.uploadData = this.progress[key].data;
                this.columns = this.progress[key].columns;
            }
        }

        this.dialogRef.disableClose = true;

        forkJoin(allProgressObservables).subscribe(end => {
            this.dataSource = new MatTableDataSource(this.uploadData);
            this.dataSource.paginator = this.paginator;
            this.validateSuccessful = true;
            this.dialogRef.disableClose = false;
        });
    }

    upload() {
        var uploaddata = this.uploadData.filter(o => o.Error == '');
        if (uploaddata.length) {
            this.ServerUploadDataService.uploadData({
                Data: uploaddata,
                UserId: this.UserLoggedIn.Id,
                UserRoleId: this.UserLoggedIn.DefaultRoleId,
            }).subscribe((data: any) => {

                if (data.Success) {
                    this.toastr.showNotification('top', 'right', data.Message, 'success');
                    return this.dialogRef.close();
                } else {
                    this.toastr.showNotification('top', 'right', data.Message, 'danger');
                    return this.dialogRef.close();
                }

            });
        }
    }

    exportTemplate() {
        this.ServerUploadDataService.exportAsExcelFile(headers, 'ServerBulkUploadTemplate');
    }

}
