import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { Http } from '@angular/http';
import { TimePicker } from "ui/time-picker";
import { Router } from "@angular/router";
import { Page } from "ui/page";
import 'rxjs/add/operator/map';

@Component({
    selector: "my-app",
    templateUrl: "app.request.html",
})

export class RequestComponent implements OnInit {
    public duration: string = "Nothing yet";
    public durationTraffic: string = "";
    public departure: string = "";
    public arrival: string = "";
    public departureTime: number = Date.now();
    public arrivalTime: Date = new Date();
    public estimatedArrival: number = 0;
    public callItIn: string = "";

    constructor(private http: Http, private router: Router, private page: Page) {
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
    }

    @ViewChild("timePicker") tp: ElementRef;

    configure(timePicker: TimePicker) {
        timePicker.hour = 9;
        timePicker.minute = 25;
    }

    public get message(): string {
        return this.duration;
    }
    public get durationTraf(): string {
        return this.durationTraffic;
    }
    public loadRemote() {
        this.http.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=` + this.departure + `&destinations=` + this.arrival + `&mode=car&departure_time=` + this.departureTime + `&language=en-EN&key=
        `).map(res => res.json()).subscribe((response: any) => {
                this.duration = "Duration: " + this.cleanString(JSON.stringify(response.rows[0].elements[0].duration.text));
                this.durationTraffic = "Duration in traffic: " + this.cleanString(JSON.stringify(response.rows[0].elements[0].duration_in_traffic.text));
                let timePicker: TimePicker = <TimePicker>this.tp.nativeElement;
                this.arrivalTime.setHours(timePicker.hour, timePicker.minute);
                var estT = new Date(this.estimatedArrival);
                this.estimatedArrival = this.departureTime + (response.rows[0].elements[0].duration.value * 1000);
                var estTC = new Date(this.estimatedArrival);
                this.compareTimes();
                this.router.navigate(["/result"], { queryParams: { result: this.callItIn, duration: this.duration, eta: estTC } });
            });
    }
    public cleanString(string) {
        var cleanString = string.replace(/"/g, '');
        return cleanString;
    }
    public compareTimes() {
        if (this.estimatedArrival > this.arrivalTime.getTime()) {
            this.callItIn = "Late";
        }
        else {
            this.callItIn = "On time";
        }
    }
}