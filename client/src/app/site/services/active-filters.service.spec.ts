import { TestBed } from '@angular/core/testing';

import { ActiveFiltersService } from './active-filters.service';

describe(`ActiveFiltersService`, () => {
    let service: ActiveFiltersService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ActiveFiltersService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});