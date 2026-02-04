import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'roleTranslate',
    standalone: true
})
export class RoleTranslatePipe implements PipeTransform {
    private roleMap: { [key: string]: string } = {
        'admin': 'Administrador',
        'vigilante': 'Vigilante',
        'resident': 'Residente'
    };

    transform(value: string): string {
        return this.roleMap[value] || value;
    }
}
