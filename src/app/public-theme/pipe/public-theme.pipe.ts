import { Pipe, PipeTransform } from "@angular/core";
import { PublicThemeService } from "../service/public-theme.service";
import { PublicThemeInterface } from "../model/public-theme.model";

@Pipe({
  name: "publicThemePipe",
  standalone: true,
})
export class PublicThemePipe implements PipeTransform {
  constructor(private publicThemeService: PublicThemeService) {}
  /**Given the id of the public theme return the public theme */
  transform(id: string): PublicThemeInterface | undefined {
    return this.publicThemeService.getPublicTheme(id);
  }
}
