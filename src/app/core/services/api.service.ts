import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = 'http://localhost:8000/api';

    constructor(private http: HttpClient) { }

    // Users
    getUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    // Apartments
    getApartments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/apartments`);
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
    getResidents(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/residents`);
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
    getVehicles(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/vehicles`);
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



    // Parking
    registerEntry(plate: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/parking/entry`, { plate });
    }

    registerExit(plate: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/parking/exit`, { plate });
    }

    getParkingStatus(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/parking/status`);
    }

    updateParkingSettings(settings: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/parking/settings`, settings);
    }


}
