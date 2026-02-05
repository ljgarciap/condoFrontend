import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = '/api';

    constructor(private http: HttpClient) { }

    // Users
    getUsers(page: number = 1, search: string = '', perPage: number = 10): Observable<any> {
        let params: any = { page, per_page: perPage };
        if (search) params.search = search;
        return this.http.get<any>(`${this.apiUrl}/users`, { params });
    }

    createUser(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/users`, data);
    }

    updateUser(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/users/${id}`, data);
    }

    deleteUser(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
    }

    getDashboardStats(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
    }

    // Notifications
    getNotifications(page: number = 1, perPage: number = 10, filter: 'received' | 'sent' = 'received'): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/notifications`, { params: { page, per_page: perPage, filter } });
    }

    sendNotification(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/notifications`, data);
    }

    sendNotificationWithFile(formData: FormData): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/notifications`, formData);
    }

    markNotificationRead(id: number): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/notifications/${id}/read`, {});
    }

    acceptPolicies(): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/policies/accept`, {});
    }

    uploadChunk(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/chunks/upload`, data);
    }

    // Vigilantes (Legacy - use createUser)
    // createVigilante(data: any): Observable<any> {
    //     return this.http.post<any>(`${this.apiUrl}/vigilantes`, data);
    // }

    // Apartments
    getApartments(page: number = 1, search: string = '', perPage: number = 5): Observable<any> {
        let params: any = { page, per_page: perPage };
        if (search) params.search = search;
        return this.http.get<any>(`${this.apiUrl}/apartments`, { params });
    }

    createApartment(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/apartments`, data);
    }

    updateApartment(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/apartments/${id}`, data);
    }

    deleteApartment(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/apartments/${id}`);
    }

    // Residents
    getResidents(page: number = 1, search: string = '', perPage: number = 5): Observable<any> {
        let params: any = { page, per_page: perPage };
        if (search) params.search = search;
        return this.http.get<any>(`${this.apiUrl}/residents`, { params });
    }

    createResident(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/residents`, data);
    }

    updateResident(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/residents/${id}`, data);
    }

    deleteResident(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/residents/${id}`);
    }

    // Vehicles
    getVehicles(page: number = 1, search: string = '', perPage: number = 5): Observable<any> {
        let params: any = { page, per_page: perPage };
        if (search) params.search = search;
        return this.http.get<any>(`${this.apiUrl}/vehicles`, { params });
    }

    createVehicle(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/vehicles`, data);
    }

    updateVehicle(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/vehicles/${id}`, data);
    }

    deleteVehicle(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/vehicles/${id}`);
    }

    // Admin Payments (Portfolio)
    getAdminPayments(page: number = 1, perPage: number = 10): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/admin-payments`, { params: { page, per_page: perPage } });
    }

    createAdminPayment(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/admin-payments`, data);
    }

    updateAdminPayment(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/admin-payments/${id}`, data);
    }

    deleteAdminPayment(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/admin-payments/${id}`);
    }



    // Parking
    registerEntry(plate: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/parking/entry`, { plate });
    }

    registerExit(plate: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/parking/exit`, { plate });
    }

    registerAccess(identifier: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/parking/access`, { identifier });
    }

    getParkingStatus(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/parking/status`);
    }

    updateParkingSettings(settings: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/parking/settings`, settings);
    }

    getParkingHistory(page: number = 1, perPage: number = 20): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/parking/history`, { params: { page, per_page: perPage } });
    }

    // People & Visits
    getPeople(page: number = 1, search: string = '', perPage: number = 5): Observable<any> {
        let params: any = { page, per_page: perPage };
        if (search) params.search = search;
        return this.http.get<any>(`${this.apiUrl}/people`, { params });
    }

    getPersonByDocument(document: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/people/search/${document}`);
    }

    createPerson(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/people`, data);
    }

    updatePerson(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/people/${id}`, data);
    }

    deletePerson(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/people/${id}`);
    }

    getVisits(page: number = 1, search: string = '', perPage: number = 5): Observable<any> {
        let params: any = { page, per_page: perPage };
        if (search) params.search = search;
        return this.http.get<any>(`${this.apiUrl}/visits`, { params });
    }

    createVisit(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/visits`, data);
    }

    updateVisit(id: number, data: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/visits/${id}`, data);
    }

    // Pets
    getPets(page: number = 1, search: string = '', perPage: number = 10): Observable<any> {
        let params: any = { page, per_page: perPage };
        if (search) params.search = search;
        return this.http.get<any>(`${this.apiUrl}/pets`, { params });
    }

    createPet(pet: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/pets`, pet);
    }

    updatePet(id: number, pet: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/pets/${id}`, pet);
    }

    deletePet(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/pets/${id}`);
    }
}
