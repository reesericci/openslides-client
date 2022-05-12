import { Projection } from '../../../../../../domain/models/projector/projection';
import { ProjectorTitle, HasProjectorTitle } from '../../../../../../domain/interfaces/has-projector-title';
import { BaseProjectableViewModel } from '../../../view-models/base-projectable-model';
import { Projectiondefault } from '../../../../../../domain/models/projector/projection-default';
import { HasMeeting } from '../../../view-models/has-meeting';
import { ViewProjector } from './view-projector';
import { ProjectionBuildDescriptor } from '../../../view-models/projection-build-descriptor';

export class ViewProjection extends BaseProjectableViewModel<Projection> {
    public static COLLECTION = Projection.COLLECTION;
    protected _collection = Projection.COLLECTION;

    public get projection(): Projection {
        return this._model;
    }

    public isEqualToDescriptor(descriptor: ProjectionBuildDescriptor | null): boolean {
        if (!this || !descriptor) {
            return false;
        }
        return (
            this.content_object_id === descriptor.content_object_id &&
            !!this.stable === !!descriptor.stable &&
            ((!this.type && !descriptor.type) || this.type === descriptor.type)
        );
    }

    public override getProjectorTitle(): ProjectorTitle {
        return this.content_object.getProjectorTitle(this.getModel());
    }

    public override getTitle = () => this.getProjectorTitle().title;

    public getSubtitle(): string {
        return this.getProjectorTitle().subtitle || ``;
    }

    public getProjectiondefault(): Projectiondefault | null {
        return this.content_object?.getProjectiondefault();
    }

    public override getProjectionBuildDescriptor(): ProjectionBuildDescriptor {
        return {
            content_object_id: this.content_object_id,
            stable: this.stable,
            type: this.type,
            getDialogTitle: this.getTitle,
            projectionDefault: this.getProjectiondefault()
        };
    }
}
interface IProjectionRelations {
    current_projector?: ViewProjector;
    preview_projector?: ViewProjector;
    history_projector?: ViewProjector;
    content_object: BaseProjectableViewModel & HasProjectorTitle;
}
export interface ViewProjection extends Projection, IProjectionRelations, HasMeeting {}