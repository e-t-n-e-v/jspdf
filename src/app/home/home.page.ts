import { Component } from "@angular/core";
import { LoadingController } from "@ionic/angular";
import * as jsPDF from "jspdf";
import domtoimage from "dom-to-image";
import { IWriteOptions, File } from "@ionic-native/file/ngx";
import { FileOpener } from "@ionic-native/file-opener/ngx";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"]
})
export class HomePage {
  loading: any;

  constructor(
    public loadingController: LoadingController,
    private file: File,
    private fileOpener: FileOpener,
    private http: HttpClient
  ) {}

  async presentLoading(msg) {
    this.loading = await this.loadingController.create({
      message: msg
    });
    return await this.loading.present();
  }

  exportPdf2() {
    this.presentLoading("Creating PDF file...");
    const div = document.getElementById("printable-area");
    const options = { background: "white", height: 595, width: 842 };
    domtoimage
      .toPng(div, options)
      .then(dataUrl => {
        //Initialize JSPDF
        var doc = new jsPDF("p", "mm", "a4");
        //Add image Url to PDF
        doc.addImage(dataUrl, "PNG", 20, 20, 240, 180);

        let pdfOutput = doc.output();
        // using ArrayBuffer will allow you to put image inside PDF
        let buffer = new ArrayBuffer(pdfOutput.length);
        let array = new Uint8Array(buffer);
        for (var i = 0; i < pdfOutput.length; i++) {
          array[i] = pdfOutput.charCodeAt(i);
        }

        //This is where the PDF file will stored , you can change it as you like
        // for more information please visit https://ionicframework.com/docs/native/file/
        const directory = this.file.dataDirectory;
        const fileName = "invoice.pdf";
        let options: IWriteOptions = { replace: true };

        this.file.checkFile(directory, fileName).then(success => {
          //Writing File to Device
          this.file
            .writeFile(directory, fileName, buffer, options)
            .then(success => {
              this.loading.dismiss();
              alert("File created Succesfully" + JSON.stringify(success));
              this.fileOpener
                .open(this.file.dataDirectory + fileName, "application/pdf")
                .then(() => alert("File is opened"))
                .catch(e => alert("Error opening file: " + e));
            })
            .catch(error => {
              this.loading.dismiss();
              alert("Cannot Create File " + JSON.stringify(error));
            });
        });
        // .catch(error => {
        //   //Writing File to Device
        //   this.file
        //     .writeFile(directory, fileName, buffer)
        //     .then(success => {
        //       this.loading.dismiss();
        //       console.log(
        //         "File created Succesfully" + JSON.stringify(success)
        //       );
        //       this.fileOpener
        //         .open(this.file.dataDirectory + fileName, "application/pdf")
        //         .then(() => console.log("File is opened"))
        //         .catch(e => console.log("Error opening file", e));
        //     })
        //     .catch(error => {
        //       this.loading.dismiss();
        //       console.log("Cannot Create File " + JSON.stringify(error));
        //     });
        // });
      })
      .catch(function(error) {
        this.loading.dismiss();
        alert("oops, something went wrong! " + error);
      });
  }

  exportPdf() {
    let options: IWriteOptions = { replace: true };
    let doc = new jsPDF("p", "pt", "letter");
    let fileName = "example.pdf";
    // doc.setFont("courier");
    doc.text(" 汉字 sample data goes here", 100, 100);
    let blob = doc.output("blob", { type: "application/pdf" });
    // debugger;
    this.file
      .writeFile(this.file.dataDirectory, fileName, blob, options)
      .then(value => {
        // preview
        alert("File created Succesfully" + JSON.stringify(value));
        this.fileOpener
          .open(this.file.dataDirectory + fileName, "application/pdf")
          .then(() => alert("File is opened"))
          .catch(e => alert("Error opening file: " + e));
      })
      .catch(error => {
        alert("Error creating File: " + JSON.stringify(error));
      });
  }

  DownloadFile() {
    try {
      this.http
        .get(`http://8.8.8.133/sample/`, {
          responseType: "arraybuffer"
        })
        .subscribe(res => {
          this.DownloadType(res, "application/pdf");
        });
    } catch (e) {
      alert("Error:" + e);
    }
  }

  DownloadType(data: any, type: string) {
    try {
      let fileName = "example.pdf";
      let options: IWriteOptions = { replace: true };
      var blob = new Blob([data], { type: type });
      // var url = window.URL.createObjectURL(blob);
      // var pwa = window.open(url, "_blank");
      // if (!pwa || pwa.closed || typeof pwa.closed == "undefined") {
      //   console.log("Please disable your popup blocker and try again.");
      // }
      this.file
        .writeFile(this.file.dataDirectory, fileName, blob, options)
        .then(value => {
          // preview
          alert("File created Succesfully" + JSON.stringify(value));
          this.fileOpener
            .open(this.file.dataDirectory + fileName, "application/pdf")
            .then(() => alert("File is opened"))
            .catch(e => alert("Error opening file: " + e));
        })
        .catch(error => {
          alert("Error creating File: " + JSON.stringify(error));
        });
    } catch (e) {
      alert("Error in: " + e);
    }
  }
}
