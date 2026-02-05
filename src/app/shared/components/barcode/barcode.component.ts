import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import JsBarcode from 'jsbarcode';

@Component({
    selector: 'app-barcode',
    standalone: true,
    imports: [CommonModule],
    template: `<svg #barcode></svg>`,
})
export class BarcodeComponent implements OnChanges, AfterViewInit {
    @Input() value: string = '';
    @Input() width: number = 2;
    @Input() height: number = 40;
    @Input() displayValue: boolean = false;

    @ViewChild('barcode') barcodeElement!: ElementRef;

    ngAfterViewInit() {
        this.generateBarcode();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['value'] || changes['width'] || changes['height']) {
            this.generateBarcode();
        }
    }

    private generateBarcode() {
        if (this.barcodeElement && this.value) {
            JsBarcode(this.barcodeElement.nativeElement, this.value, {
                width: this.width,
                height: this.height,
                displayValue: this.displayValue,
                margin: 0
            });
        }
    }
}
