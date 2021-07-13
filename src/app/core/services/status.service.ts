import {Injectable} from '@angular/core';
import {ApiService} from './api.service';
import {map} from 'rxjs/operators';
import {DataTransformService} from './data-transform.service';
import {DateService} from './date.service';
import {DatePipe} from '@angular/common';
import {ExtendedStatus} from '../models/extended_status.model';

@Injectable({
  providedIn: 'root'
})
export class StatusService {

  constructor(
    private apiService: ApiService,
    private dataTransformService: DataTransformService,
    private dateService: DateService,
    private datePipe: DatePipe
  ) { }

  find(objectType, objectId) {
    return this.apiService.get('/' + objectType + '/' + objectId + '/estatuses').pipe(
      map((estatuses: ExtendedStatus[]) => {
        return estatuses.map(estatus => {
          estatus.st_created_at = new Date(estatus.st_created_at);
          return estatus as ExtendedStatus;
        });
      })
    );
  }

  post(objectType, objectId, status, notify = false) {
    return this.apiService.post('/' + objectType + '/' + objectId + '/statuses', {
      status,
      notify
    });
  }

  getStatusCategory(comment, type) {
    let statusCategory = {};
    const lowerCaseComment = comment && comment.toLowerCase();

    switch (true) {
      case (lowerCaseComment.indexOf('hotel request') > -1) || (lowerCaseComment.indexOf('transportation request') > -1):
        statusCategory = {
          category: 'Others',
          icon: 'circle'
        };
        break;
      case (lowerCaseComment.indexOf('created') > -1 && lowerCaseComment.indexOf('reversal') > -1):
        statusCategory = {
          category: type + ' Reversed',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('created') > -1:
        statusCategory = {
          category: type + ' Created',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('updated') > -1:
        statusCategory = {
          category: type + ' Edited',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('attachment') > -1:
        statusCategory = {
          category: 'Receipt Attached',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('report') > -1:
        statusCategory = {
          category: 'Report',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('flagged') > -1:
        statusCategory = {
          category: 'Flagged',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('the following action(s) will be taken') > -1:
        statusCategory = {
          category: 'Policy Violation',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('additional approvers are not present') > -1:
        statusCategory = {
          category: 'Failed to run policies',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('verified') > -1:
        statusCategory = {
          category: 'Verified',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('approved') > -1:
        statusCategory = {
          category: type + ' Approved',
          icon: 'circle'
        };
        break;
      case lowerCaseComment.indexOf('payment_processing') > -1:
        statusCategory = {
          category: 'Processing Payment',
          icon: 'circle'
        };
        break;
      case (lowerCaseComment.indexOf('paid') > -1):
        statusCategory = {
          category: 'Paid',
          icon: 'circle'
        };
        break;
      case (lowerCaseComment.indexOf('expense issues') > -1):
        statusCategory = {
          category: 'Expense Issues',
          icon: 'circle'
        };
        break;
      default:
        statusCategory = {
          category: 'Others',
          icon: 'circle'
        };
        break;
    }

    return statusCategory;
  }

  createStatusMap(statuses, type) {
    const modifiedStatuses = statuses.map((status) => {
      const statusCategoryAndIcon = this.getStatusCategory(status.st_comment, type);
      status.st = Object.assign({}, status.st, statusCategoryAndIcon);
      return status;
    });

    return modifiedStatuses;
  }

  findLatestComment(id, type, orgUserId) {
    return this.find(type, id).pipe(
      map((estatuses) => {
        const nonSystemEStatuses = estatuses.filter(eStatus => eStatus.us_full_name);
        const userComments = nonSystemEStatuses.filter((estatus) => {
          return estatus.st_org_user_id === orgUserId;
        });
        const sortedStatus = this.sortStatusByDate(userComments);
        if (sortedStatus.length) {
          return sortedStatus[0].st_comment;
        }
      })
    );
  }

  sortStatusByDate(estatus) {
    estatus.sort((a, b) => {
      const dateA = a.st_created_at;
      const dateB = b.st_created_at;
      if (dateA.getTime() > dateB.getTime()) {
        return -1;
      } else {
        return 1;
      }
    });

    return estatus;
  }

  filterNonSystemEStatuses(eStatus) {
    return eStatus.us.full_name;
  }

  filterSystemStatuses(status) {
    return ['SYSTEM', 'POLICY'].indexOf(status.st.org_user_id) > -1;
  }

  filterSystemEStatuses(eStatus) {
    return eStatus.st.org_user_id !== 'SYSTEM';
  }
}
