import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { Permission } from 'src/app/domain/definitions/permission';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { BaseMeetingRelatedRepository } from 'src/app/gateways/repositories/base-meeting-related-repository';
import { Group } from 'src/app/domain/models/users/group';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { Fieldsets, DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';
import { GroupAction } from './group.action';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Injectable({
    providedIn: 'root'
})
export class GroupRepositoryService extends BaseMeetingRelatedRepository<ViewGroup, Group> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, Group);
    }

    public override getFieldsets(): Fieldsets<Group> {
        const titleFields: (keyof Group)[] = [`name`];
        const listFields: (keyof Group)[] = titleFields.concat([`permissions`]);
        const detailFields: (keyof Group)[] = listFields.concat([
            `admin_group_for_meeting_id`,
            `default_group_for_meeting_id`,
            `weight`,
            `user_ids`
        ]);
        return {
            title: titleFields,
            list: listFields,
            [DEFAULT_FIELDSET]: detailFields
        };
    }

    public getTitle = (viewGroup: ViewGroup) => viewGroup.name;

    public getVerboseName = (plural: boolean = false) => _(plural ? `Groups` : `Group`);

    public getNameForIds(...ids: number[]): string {
        return this.getSortedViewModelList()
            .filter(group => ids.includes(group.id))
            .map(group => _(group.getTitle()))
            .join(`, `);
    }

    public create(...groups: Partial<Group>[]): Promise<Identifiable[]> {
        const payload = groups.map(group => this.getCreatePayload(group));
        return this.sendBulkActionToBackend(GroupAction.CREATE, payload);
    }

    public update(update: Partial<Group>, group: Identifiable): Promise<void> {
        const payload = {
            id: group.id,
            name: update.name
        };
        return this.sendActionToBackend(GroupAction.UPDATE, payload);
    }

    public delete(group: Identifiable): Promise<void> {
        return this.sendActionToBackend(GroupAction.DELETE, { id: group.id });
    }

    /**
     * Toggles the given permisson.
     *
     * @param group The group
     * @param permission The permission to toggle
     */
    public async togglePermission(group: ViewGroup, permission: Permission): Promise<void> {
        const payload = {
            id: group.id,
            permission,
            set: !group.hasPermission(permission)
        };
        return this.sendActionToBackend(GroupAction.SET_PERMISSION, payload);
    }

    private getCreatePayload(partialGroup: Partial<Group>): Partial<Group> {
        return {
            meeting_id: this.activeMeetingId!,
            name: partialGroup.name,
            permissions: partialGroup.permissions
        };
    }
}