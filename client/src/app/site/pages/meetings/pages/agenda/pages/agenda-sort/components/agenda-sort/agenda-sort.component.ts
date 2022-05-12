import { Component, OnInit } from '@angular/core';
import {
    BaseSortTreeViewComponent,
    SortTreeFilterId,
    SortTreeFilterOption
} from 'src/app/ui/base/base-sort-tree-view-component';
import { ViewAgendaItem } from 'src/app/site/pages/meetings/pages/agenda';
import { BehaviorSubject, Observable } from 'rxjs';
import { ItemTypeChoices, AgendaItemType } from 'src/app/domain/models/agenda/agenda-item';
import { MeetingComponentServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-component-service-collector.service';
import { TranslateService } from '@ngx-translate/core';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { AgendaItemControllerService } from '../../../../services/agenda-item-controller.service/agenda-item-controller.service';

@Component({
    selector: 'os-agenda-sort',
    templateUrl: './agenda-sort.component.html',
    styleUrls: ['./agenda-sort.component.scss']
})
export class AgendaSortComponent extends BaseSortTreeViewComponent<ViewAgendaItem> implements OnInit {
    /**
     * All agendaItems sorted by their weight {@link ViewItem.weight}
     */
    public itemsObservable: Observable<ViewAgendaItem[]>;

    /**
     * These are the available options for filtering the nodes.
     * Adds the property `state` to identify if the option is marked as active.
     * When reset the filters, the option `state` will be set to `false`.
     */
    public filterOptions: SortTreeFilterOption[] = ItemTypeChoices.map(item => ({
        label: item.name,
        id: item.key,
        state: false
    }));

    /**
     * BehaviourSubject to get informed every time the filters change.
     */
    protected activeFilters = new BehaviorSubject<SortTreeFilterId[]>([]);

    public constructor(
        translate: TranslateService,
        promptService: PromptService,
        private agendaRepo: AgendaItemControllerService
    ) {
        super(translate, promptService);
        this.itemsObservable = this.agendaRepo.getViewModelListObservable();
    }

    /**
     * Function to emit the active filters.
     * Filters will be stored in an array to prevent duplicated options.
     * Furthermore if the option is already included in this array, then it will be deleted.
     * This array will be emitted.
     *
     * @param filter Is the filter that was activated by the user.
     */
    public onFilterChange(filter: SortTreeFilterId): void {
        const value = this.activeFilters.value;
        if (!value.includes(filter)) {
            value.push(filter);
        } else {
            value.splice(value.indexOf(filter), 1);
        }
        this.activeFilters.next(value);
    }

    /**
     * OnInit method
     */
    public ngOnInit(): void {
        /**
         * Passes the active filters as an array to the subject.
         */
        const filter = this.activeFilters.subscribe((value: SortTreeFilterId[]) => {
            this.hasActiveFilter = value.length === 0 ? false : true;
            this.changeFilter.emit(
                (item: ViewAgendaItem): boolean => !(value.includes(item.type) || value.length === 0)
            );
        });
        this.subscriptions.push(filter);
    }

    /**
     * Function to set the active filters to null.
     */
    public resetFilters(): void {
        for (const option of this.filterOptions) {
            option.state = false;
        }
        this.activeFilters.next([]);
    }

    /**
     * Function to save the tree by click.
     */
    public async onSave(): Promise<void> {
        if (this.osSortTree) {
            await this.agendaRepo.sortItems(this.osSortTree.getTreeData());
            this.osSortTree.setSubscription();
        }
    }

    /**
     * Function to emit if the nodes should be expanded or collapsed.
     *
     * @param nextState Is the next state, expanded or collapsed, the nodes should be.
     */
    public override onStateChange(nextState: boolean): void {
        this.changeState.emit(nextState);
    }

    /**
     * Function, that returns an icon depending on the given tag.
     *
     * @param type of which the icon will be assigned to.
     *
     * @returns The icon it should be.
     */
    public getIcon(type: SortTreeFilterId): string {
        switch (type) {
            case AgendaItemType.COMMON:
                return `public`;
            case AgendaItemType.INTERNAL:
                return `visibility`;
            case AgendaItemType.HIDDEN:
                return `visibility_off`;
            default:
                return `public`;
        }
    }
}