import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { IssuesListComponent } from './app/components/issues-list/issues-list.component';

bootstrapApplication(IssuesListComponent, {
  providers: [
    provideHttpClient(),
  ]
}).catch(err => console.error(err));
