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
import { Component, OnInit, Injectable } from '@angular/core';
import { BusinessMappingService } from './businessmapping.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { AgentMappingLabel } from '@insights/app/modules/admin/businessmapping/agentMappingLabel';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material';
import { MessageDialogService } from '@insights/app/modules/application-dialog/message-dialog-service';
import { DataSharedService } from '@insights/common/data-shared-service';

@Component({
  selector: 'app-businessmapping',
  templateUrl: './businessmapping.component.html',
  styleUrls: ['./businessmapping.component.css', './../../home.module.css']
})

export class BusinessMappingComponent implements OnInit {

  selectedAgent: any;
  agentMappingLabels: AgentMappingLabel[] = [];
  agentDataSource: any = [];
  agentList: any = [];
  agentPropertyDataSource: any = [];
  displayedToolColumns: any = [];
  displayedColumns: any = [];
  selection: any = new SelectionModel(true, []);
  spans = [];
  isEditData = false;
  isListView = false;
  noToolsData = false;
  disableAdd = false;
  label: String = undefined;
  agentPropertyList = {};
  selectedAgentMappingLabels: AgentMappingLabel[] = [];
  selectedMappingAgent: any = undefined;
  subHeading: String = "";
  now: any;
  currentUserName: String;
  masterToolPropertiesData: any;
  actionType: any;
  additionalProperties = ['inSightsTime', 'categoryName', 'inSightsTimeX', 'toolName',
    'uuid', 'type', 'businessmappinglabel', 'propertiesString', 'id', 'deleted', 'adminuser'];
  unwantedLabel = ['businessmappinglabel', 'propertiesString', 'id', 'type', 'deleted']
  constructor(private businessMappingService: BusinessMappingService, public messageDialog: MessageDialogService,
    private dataShare: DataSharedService) {
    this.gatToolInfo();
  }

  ngOnInit() {
    this.selectedAgent = undefined;
    this.isListView = false;
    this.agentDataSource = [];
    this.selectedMappingAgent = undefined;
    this.now = new Date();
    this.currentUserName = this.dataShare.getUserName();
  }


  // Loads Register Agent List
  async gatToolInfo() {
    try {
      var dictResponse = await this.businessMappingService.loadToolsAndCategories();
      //console.log(dictResponse);
      if (dictResponse != null) {
        for (var key in dictResponse.data) {
          this.agentList.push(dictResponse.data[key]);
        }
      }
    } catch (error) {
      //console.log(error);
    }
  }

  getAgentMappingDetail(selectedAgent) {
    this.disableAdd = false;
    this.masterToolPropertiesData = undefined;
    this.selectedAgent = selectedAgent;
    var self = this;
    //console.log(this.selectedAgent)
    this.businessMappingService.loadToolProperties(this.selectedAgent.toolName, selectedAgent.categoryName)
      .then(function (data) {
        //console.log(data);
        self.masterToolPropertiesData = data;
      });
    this.displayAgentMappingDetail()
  }

  displayAgentMappingDetail() {
    var self = this;
    self.isEditData = false;
    this.disableAdd = false;
    var agentDataSourceArray = [];
    self.businessMappingService.getToolMapping(this.selectedAgent.toolName)
      .then(function (usersMappingResponseData) {
        if (usersMappingResponseData.status == "success") {
          if (usersMappingResponseData.data != undefined) {
            usersMappingResponseData.data = self.clubProperties(usersMappingResponseData.data, true);
            agentDataSourceArray = usersMappingResponseData.data;
            if (agentDataSourceArray.length == 0) {
              self.noToolsData = true;
            } else {
              self.noToolsData = false;
            }
          }
        } else {
          self.messageDialog.showApplicationsMessage("Something went wrong with service,Please try again ", "WARN");
        }
        self.displayedColumns = ['radio', 'mappinglabel', 'properties']
        self.isListView = true;
        self.subHeading = "List of Labels";
        self.agentDataSource = new MatTableDataSource(agentDataSourceArray);
        //console.log(self.agentDataSource);
        //console.log(self.selectedMappingAgent);
      });
  }

  clubProperties(jsonData, isArray) {
    // console.log(jsonData);
    if (isArray) {
      var length = jsonData.length;
      for (let i = 0; i < length; i++) {
        let propString = undefined;
        //console.log(Object.keys(jsonData[i]));
        for (let key of Object.keys(jsonData[i])) {
          if (this.additionalProperties.indexOf(key) > -1) {
            //console.log(jsonData[i][key]);
          } else {
            if (propString == undefined) {
              propString = key + " <b> : </b>" + jsonData[i][key];
            } else {
              propString += "" + "<br>" + key + " <b> : </b>" + jsonData[i][key];
            }
          }
        }
        jsonData[i]['propertiesString'] = propString;
      }
    } else {
      let propString = undefined;
      for (let key of Object.keys(jsonData)) {
        if (this.additionalProperties.indexOf(key) > -1) {
          //console.log(jsonData[key]);
        } else {
          if (propString == undefined) {
            propString = key + " <b> : </b>" + jsonData[key];
          } else {
            propString += "" + "<br>" + key + " <b> : </b>" + jsonData[key];
          }
        }
      }
      jsonData['propertiesString'] = propString;
    }
    return jsonData;
  }

  async loadAgentProperties(selectedAgent) {
    try {
      this.agentPropertyDataSource = [];
      this.agentMappingLabels = [];
      this.displayedToolColumns = ['checkbox', 'toolproperties', 'propertyValue', 'propertyLabel'];
      const regex = new RegExp("orgLevel", 'gi')
      if (this.masterToolPropertiesData.data != undefined && this.masterToolPropertiesData.status == "success") {
        if (this.actionType == 'edit') {
          var existingKeys = Object.keys(this.selectedMappingAgent);

          for (let masterData of this.masterToolPropertiesData.data) {
            //console.log(masterData);
            var checkvalue = regex.test(masterData);
            if (checkvalue) {
              // Skip Key changes
            } else {
              if (existingKeys.indexOf(masterData) == -1) {
                let agentMappingLabel = new AgentMappingLabel(masterData, masterData, "", "a", true);
                this.agentMappingLabels.push(agentMappingLabel);
              } else {
                let agentMappingLabel;
                if (this.unwantedLabel.indexOf(masterData) == -1) {
                  if (this.additionalProperties.indexOf(masterData) > -1) {
                    agentMappingLabel = new AgentMappingLabel(masterData, masterData, this.selectedMappingAgent[masterData], "a", false);
                  } else {
                    agentMappingLabel = new AgentMappingLabel(masterData, masterData, this.selectedMappingAgent[masterData], "a", true);
                  }
                  this.agentMappingLabels.push(agentMappingLabel);
                }
              }
            }
          }
          this.label = this.selectedMappingAgent.businessmappinglabel;
        } else if (this.actionType == "add") {
          for (var key in this.masterToolPropertiesData.data) {
            //console.log(key + "   ======  " + this.masterToolPropertiesData.data[key]);
            var checkvalue = regex.test(this.masterToolPropertiesData.data[key]);
            if (checkvalue) {
              // Skip Key changes
            } else {
              let agentMappingLabel;
              if (this.additionalProperties.indexOf(this.masterToolPropertiesData.data[key]) > -1) {
                agentMappingLabel = new AgentMappingLabel(key, this.masterToolPropertiesData.data[key], "", "a", false);
              } else {
                agentMappingLabel = new AgentMappingLabel(key, this.masterToolPropertiesData.data[key], "", "a", true);
              }
              this.agentMappingLabels.push(agentMappingLabel);
            }
          }
        }
        this.cacheSpan('label', d => d.id);
        this.agentPropertyDataSource = this.getagentPropertyDataSource();
      } else {
        this.agentPropertyDataSource = [];
      }
      this.agentPropertyDataSource = new MatTableDataSource(this.agentPropertyDataSource);
    } catch (error) {
      console.log(error);
    }
  }

  getagentPropertyDataSource() {
    return this.agentMappingLabels.filter(a => a.editProperties == true)
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.agentPropertyDataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. readChange*/
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.agentPropertyDataSource.data.forEach(row => this.selection.select(row));
  }

  statusEdit(selectedElement) {
    this.isListView = true;
    this.isEditData = true;
  }

  cacheSpan(key, accessor) {
    for (let i = 0; i < this.agentMappingLabels.length;) {
      let currentValue = accessor(this.agentMappingLabels[i].label);
      let count = 1;
      // Iterate through the remaining rows to see how many match the current value as retrieved through the accessor.
      for (let j = i + 1; j < this.agentMappingLabels.length; j++) {
        if (currentValue != accessor(this.agentMappingLabels[j].label)) {
          break;
        }
        count++;
      }
      if (!this.spans[i]) {
        this.spans[i] = {};
      }
      //console.log(key + "  " + count);
      // Store the number of similar values that were found (the span) and skip i to the next unique row.
      this.spans[i][key] = count;
      i += count;//+
    }
  }

  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }

  editData() {
    const numSelected = this.selection.selected.length
    this.isListView = false;
    this.noToolsData = false
    this.actionType = "edit"
    this.loadAgentProperties(this.selectedAgent);
    this.isEditData = false;
    this.disableAdd = true;
    this.subHeading = "Edit Label for " + this.selectedMappingAgent.businessmappinglabel;
  }

  addAgentLabelData() {
    this.isEditData = false;
    this.disableAdd = false;
    this.noToolsData = false
    this.isListView = false;
    this.actionType = "add"
    this.subHeading = "Add Label";
    this.label = undefined;
    this.loadAgentProperties(this.selectedAgent);

  }

  saveData() {
    var agentBMparameter;
    this.agentPropertyList = {};
    const numSelected = this.selection.selected.length;
    //console.log(this.label);
    if (numSelected == 0) {
      this.messageDialog.showApplicationsMessage("Please select atleast one Tool Property to create a Label", "WARN");
    } else if (this.label == "" || this.label == undefined) {
      this.messageDialog.showApplicationsMessage("Mapping Label value is <b>MANDATORY</b> it should not be empty", "WARN");
    } else {
      //Validate Label
      var selectedData = this.selection.selected;
      let validationMessage = '';
      selectedData.forEach(
        row => {
          //console.log("selectes rows" + selectedData.length);
          if (row.value.length == 0) {
            //console.log("new " + row.key + " : " + row.value);
            //this.messageDialog.showApplicationsMessage("Value should not be empty for propety key "+ row.key,"WARN");
            validationMessage = "Value should not be empty for propety key <b>" + row.key + "</b>";
          } else {
            let agentMappingLabelSelected = new AgentMappingLabel(row.id, row.key, row.value, this.label, true);
            this.selectedAgentMappingLabels.push(agentMappingLabelSelected);
            this.agentPropertyList[row.key] = row.value;
          }
        }
      );
      this.agentPropertyList = this.clubProperties(this.agentPropertyList, false);
      validationMessage = this.validateData(validationMessage);
      //console.log("validationMessage  " + validationMessage)
      if (validationMessage == '') {
        if (this.actionType == "add") {
          this.agentPropertyList['toolName'] = this.selectedAgent.toolName;
          this.agentPropertyList['categoryName'] = this.selectedAgent.categoryName;
          this.agentPropertyList['businessmappinglabel'] = this.label;
          this.agentPropertyList['adminuser'] = this.currentUserName;//'admin'
          this.agentPropertyList['inSightsTimeX'] = this.now;
          this.agentPropertyList['inSightsTime'] = this.now.getTime();
          delete this.agentPropertyList['propertiesString'];
          agentBMparameter = JSON.stringify(this.agentPropertyList);
          //console.log(agentBMparameter);
          this.callEditOrSaveDataAPI(agentBMparameter);
        } else if (this.actionType == "edit") {
          for (let selectedData of this.agentMappingLabels) {
            /*if (selectedData.key == 'businessmappinglabel') {
              this.agentPropertyList[selectedData.key] = this.label
            } else {*/
            if (!selectedData.editProperties) {
              this.agentPropertyList[selectedData.key] = selectedData.value;
            }
            /* }*/
          }
          this.agentPropertyList['businessmappinglabel'] = this.label;
          this.agentPropertyList['adminuser'] = this.currentUserName;;
          this.agentPropertyList['inSightsTimeX'] = this.now;
          this.agentPropertyList['inSightsTime'] = this.now.getTime();
          this.agentPropertyList['toolName'] = this.selectedAgent.toolName;
          this.agentPropertyList['categoryName'] = this.selectedAgent.categoryName;
          delete this.agentPropertyList['propertiesString'];
          agentBMparameter = JSON.stringify(this.agentPropertyList);
          //console.log(agentBMparameter);
          this.callEditOrSaveDataAPI(agentBMparameter);
        }
      } else {
        this.messageDialog.showApplicationsMessage(validationMessage, "ERROR");
        this.selection.clear()
      }
    }
  }

  public validateData(validationMessage): any {
    //let validationMessage = '';
    if (validationMessage == '') {
      var labelArray = this.label.split(":");
      var str: string = String(this.label);
      /*var regex = /^[A-Za-z0-9 ]+$/
 
        //Validate TextBox value against the Regex.
        var isValid = regex.test(str);
        if (!isValid) {
            alert("Contains Special Characters.");
        } else {
            alert("Does not contain Special Characters.");
        }*/
      var format = /[ !@#$%^&*()+\=\[\]{};'"\\|,.<>\/?]/;
      //console.log(format.test(str))
      if (format.test(str) == true) {
        //console.log("blank space in label");
        validationMessage = "Please check blank space and special charecters are not allowed, It should be like Label1:Label2:Label3";
      }
      if (this.actionType == "add") {
        for (let data of this.agentDataSource.data) {
          if (data.businessmappinglabel == this.label) {
            //console.log("label exists ");
            validationMessage = "Mapping Label already exists for tool <b>" + this.selectedAgent.toolName + " </b>.";
          }
          if (data.propertiesString == this.agentPropertyList['propertiesString']) {
            //console.log("Property Exists");
            validationMessage = "Properties with same name and value are already exists for tool <b>" + this.selectedAgent.toolName + " </b>."
          }
        }
      } else if (this.actionType == "edit") {
        for (let data of this.agentDataSource.data) {
          if (data.businessmappinglabel == this.label && data.propertiesString == this.agentPropertyList['propertiesString']) {
            //console.log(data.businessmappinglabel +","+this.label+","+","+data.propertiesString+","+this.agentPropertyList['propertiesString']);
            validationMessage = "Properties with same name and value <b> " + this.agentPropertyList['propertiesString'] + " </b> already exists for tool <b>" + this.selectedAgent.toolName + " </b>.<br>Please edit necessary values if applicable";
          }
        }
      }
    }
    return validationMessage;
  }

  callEditOrSaveDataAPI(agentBMparameter: any) {
    var self = this;
    var title = this.actionType == "add" ? "Save Label" : " Edit Label";
    var dialogmessage = this.actionType == "add" ? "Are you sure  you want to save your changes?"
      : "Please note: The changes will be applied from next data collection. <br> Are you sure you want to save your changes?";
    const dialogRef = this.messageDialog.showConfirmationMessage(title, dialogmessage, "", "ALERT", "32%");
    dialogRef.afterClosed().subscribe(result => {
      if (result == 'yes') {
        this.disableAdd = false;
        if (this.actionType == "add") {
          this.businessMappingService.saveToolMapping(agentBMparameter)
            .then(function (saveResponsedata) {
              if (saveResponsedata.status = "success") {
                self.messageDialog.showApplicationsMessage("Label <b> " + self.label + " </b> saved Successfully ", "SUCCESS");
              } else {
                self.messageDialog.showApplicationsMessage("Unable to save label <b> " + self.label + " </b> " + saveResponsedata.message, "ERROR");
              }
              self.displayAgentMappingDetail();
            });
        } else if (this.actionType == "edit") {
          this.businessMappingService.editToolMapping(agentBMparameter)
            .then(function (editResponsedata) {
              if (editResponsedata.status = "success") {
                //console.log(agentBMparameter["toolName"]);
                self.messageDialog.showApplicationsMessage("The changes you made to the <b> " + self.label + " </b> is updated Successfully ", "SUCCESS");
              } else {
                self.messageDialog.showApplicationsMessage("Unable to edit label <b> " + self.label + " </b> " + editResponsedata.message, "ERROR");
              }
              self.displayAgentMappingDetail();
            });
        }
      } else {
        this.selectedAgentMappingLabels = [];
        this.label = undefined;
        this.displayAgentMappingDetail();
        this.selection.clear()
      }
    });
  }

  deleteMapping() {
    var self = this;
    if (this.selectedMappingAgent.uuid != undefined || this.selectedMappingAgent.uuid != "") {
      var title = "Delete Label";
      //console.log(this.selectedMappingAgent);
      var dialogmessage = "Are you sure you want to delete Label <b>" + this.selectedMappingAgent.businessmappinglabel + "</b> ? <br><b> 'PLEASE NOTE THIS ACTION CANNOT BE UNDONE'</b>";
      const dialogRef = this.messageDialog.showConfirmationMessage(title, dialogmessage, "", "ALERT", "30%");
      dialogRef.afterClosed().subscribe(result => {
        if (result == 'yes') {
          this.businessMappingService.deleteToolMapping(this.selectedMappingAgent.uuid)
            .then(function (deleteResponsedata) {
              //console.log(deleteResponsedata);
              if (deleteResponsedata.status = "success") {
                self.messageDialog.showApplicationsMessage("Label delete Successfully ", "SUCCESS");
              } else {
                self.messageDialog.showApplicationsMessage("Unable to delete label " + deleteResponsedata.message, "ERROR");
              }
              self.displayAgentMappingDetail();
            });
        } else {
          this.selectedAgentMappingLabels = [];
          this.label = undefined;
          this.displayAgentMappingDetail();
          this.selection.clear()
        }
      });
    } else {
      self.messageDialog.showApplicationsMessage("Unable to delete Label , Please tray again later", "ERROR");
    }
  }
}
