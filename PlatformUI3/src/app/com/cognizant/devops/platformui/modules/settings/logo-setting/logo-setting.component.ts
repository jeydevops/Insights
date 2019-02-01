/*******************************************************************************
 * Copyright 2017 Cognizant Technology Solutions
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License.  You may obtain a copy
 * of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 * License for the specific language governing permissions and limitations under
 * the License.
 ******************************************************************************/
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LogoSettingService } from '@insights/app/modules/settings/logo-setting/logo-setting.service';
import { HttpClientModule, HttpHeaders, HttpClient } from '@angular/common/http';
import { RestAPIurlService } from '@insights/common/rest-apiurl.service'
import { CookieService } from 'ngx-cookie-service';
import { Constructor } from '@angular/cdk/table';



@Component({
  selector: 'app-logo-setting',
  templateUrl: './logo-setting.component.html',
  styleUrls: ['./logo-setting.component.css', './../../home.module.css']
})
export class LogoSettingComponent implements OnInit {
  trackingUploadedFileContentStr: string = "";
  @ViewChild('fileInput') myFileDiv: ElementRef;
  files: any;
  response: any;
  imageUploadSuccessMessage:string = " ";
  imageUploadErrorMessage:string = " ";
  size:boolean=false;
  uploadSuccess:boolean=false;
  uploadFailure:boolean=false;
  buttonEnable:boolean=false;
  url = '';

  constructor(private logoSettingService: LogoSettingService, private http: HttpClient, private restAPIUrlService: RestAPIurlService,
    private cookieService: CookieService) { }

  ngOnInit() {
  }


  onSelectFile(event) {
    this.uploadSuccess=false;
    this.uploadFailure=false;
    this.buttonEnable=true;
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event:any) => { // called once readAsDataURL is completed
        this.url = event.target.result;
      }
    }
  }

  uploadFile() {
    var restcallAPIUrl = this.restAPIUrlService.getRestCallUrl("UPLOAD_IMAGE");
    var file = this.myFileDiv.nativeElement.files[0];
    console.log(file)
    var bytes=file["size"]
    if(bytes > 1048576){
      this.size=true
      this.uploadSuccess=false;
      this.uploadFailure=true;
      this.imageUploadErrorMessage="Please select a of file size less than 1Mb"
    }
    var testFileExt = this.checkFile(file, ".png");
    console.log(testFileExt);
    if (!testFileExt) {
      this.uploadSuccess=false;
      this.uploadFailure=true;
      this.imageUploadErrorMessage="Please select a valid .PNG file"
    }
    if (testFileExt && !this.size) {
      //console.log("jill")
      var fd = new FormData();
      fd.append("file", file);
      var authToken = this.cookieService.get('Authorization');
      this.http.post(restcallAPIUrl, fd, {
        headers: {
          'Authorization': authToken
        },
      }).subscribe(event => {
        console.log(event); 
      });
      var dummy= (<HTMLInputElement>document.getElementById("file"))
      dummy.value="";
      this.uploadSuccess=true;
      this.uploadFailure=false;
      this.buttonEnable=false;
      this.imageUploadSuccessMessage="Image file uploaded successfully"
    }
  }
  checkFile(sender, validExts) {
    if (sender) {
      var fileExt = sender.name;
      fileExt = fileExt.substring(fileExt.lastIndexOf('.'));
      fileExt=fileExt.toLowerCase();
      if (validExts.indexOf(fileExt) < 0 && fileExt != "") {
        console.log(validExts.indexOf(fileExt))
        return false;
      }
      else {
        console.log(validExts.indexOf(fileExt))
        return true;
      }
    }
  }
  cancelFileUpload() {

  }


}
