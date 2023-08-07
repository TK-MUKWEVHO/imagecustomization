import { AfterViewInit, Component, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit{

  @ViewChild('canvas') canvas: any;
  context!: CanvasRenderingContext2D;
  customText: string = '';
  selectedFont: string = 'Arial';
  textColor: string = '#000000';
  private textX: number = 50;
  private textY: number = 150;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private itemImage: HTMLImageElement | null = null;
  rotationAngle: number = 0;
  textXOffset: number = 0;
  textYOffset: number = 0;
  textSize: number = 30;
  customImageWidth: number = 100; // Default width of the custom image (adjust as needed)
  customImageHeight: number = 100;
  customImage: HTMLImageElement | null = null;
  private customImageX: number = 0;
  private customImageY: number = 0;
  imgXOffset: number = 0;
  imgYOffset: number = 0;
  private isTextDragging: boolean = false;
  private isImageDragging: boolean = false;
   customImageContext!: CanvasRenderingContext2D;

  constructor() {}

  
  ngAfterViewInit() {
    this.context = this.canvas.nativeElement.getContext('2d');
    this.customImageContext = this.canvas.nativeElement.getContext('2d');
    //this.loadCustomFont();
    this.canvas.nativeElement.addEventListener('mousedown', this.onCanvasMouseDown.bind(this));
    this.canvas.nativeElement.addEventListener('mousemove', this.onCanvasMouseMove.bind(this));
    this.canvas.nativeElement.addEventListener('mouseup', this.onCanvasMouseUp.bind(this));
    this.canvas.nativeElement.addEventListener('touchstart', this.onCanvasTouchStart.bind(this));
    this.canvas.nativeElement.addEventListener('touchmove', this.onCanvasTouchMove.bind(this));
    this.canvas.nativeElement.addEventListener('touchend', this.onCanvasTouchEnd.bind(this));
  }

  onCanvasMouseDown(event: MouseEvent | TouchEvent) {
    this.isDragging = true;
    this.dragStartX = this.getClientX(event);
    this.dragStartY = this.getClientY(event);
  }

  onCanvasMouseMove(event: MouseEvent | TouchEvent) {
    if (this.isDragging) {
      const offsetX = this.getClientX(event) - this.dragStartX;
      const offsetY = this.getClientY(event) - this.dragStartY;

      // Update the position of the custom image
      if (this.customImage) {
        this.customImageX += offsetX;
        this.customImageY += offsetY;
      }

      // Update the position of the text
      this.textX += offsetX;
      this.textY += offsetY;

      this.dragStartX = this.getClientX(event);
      this.dragStartY = this.getClientY(event);
      this.applyChanges();
    }
  }

  onCanvasMouseUp() {
    this.isDragging = false;
  }

  // Touch events for mobile support
  onCanvasTouchStart(event: TouchEvent) {
    const touchX = this.getClientX(event);
    const touchY = this.getClientY(event);

    // Check if the touch is within the bounds of the custom image
    if (
      touchX >= this.customImageX && touchX <= this.customImageX + this.customImageWidth &&
      touchY >= this.customImageY && touchY <= this.customImageY + this.customImageHeight
    ) {
      // Start dragging the custom image
      this.isImageDragging = true;
      this.imgXOffset = touchX - this.customImageX;
      this.imgYOffset = touchY - this.customImageY;
      // Ensure text dragging is disabled
      this.isTextDragging = false;
    } else {
      // Start dragging the text
      this.isTextDragging = true;
      this.dragStartX = touchX - this.textX;
      this.dragStartY = touchY - this.textY;
      // Ensure custom image dragging is disabled
      this.isImageDragging = false;
    }
  }
  

  onCanvasTouchMove(event: TouchEvent) {
    if (this.isImageDragging) {
      const touchX = this.getClientX(event);
      const touchY = this.getClientY(event);

      // Update the position of the custom image
      this.customImageX = touchX - this.imgXOffset;
      this.customImageY = touchY - this.imgYOffset;

      this.applyChanges();
    } else if (this.isTextDragging) {
      const touchX = this.getClientX(event);
      const touchY = this.getClientY(event);

      const offsetX = touchX - this.dragStartX;
      const offsetY = touchY - this.dragStartY;

      // Update the position of the text
      this.textX = offsetX;
      this.textY = offsetY;

      this.applyChanges();
    }
  }


  onCanvasTouchEnd() {
    this.isDragging = false;
    this.isTextDragging = false;
  }

  // Helper function to get the client X coordinate for both events
  getClientX(event: MouseEvent | TouchEvent): number {
    if ('touches' in event) {
      return event.touches[0].clientX;
    } else {
      return event.clientX;
    }
  }

  // Helper function to get the client Y coordinate for both events
  getClientY(event: MouseEvent | TouchEvent): number {
    if ('touches' in event) {
      return event.touches[0].clientY;
    } else {
      return event.clientY;
    }
  }

  applyChanges() {
    // Check if the font is loaded before applying changes

    this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    // Draw the image first (assuming you have a variable named 'itemImage' containing the loaded image)
    if (this.itemImage) {
      this.context.drawImage(this.itemImage, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }

    if (this.itemImage) {
      this.drawCustomImage(); // Draw the custom image at its position
    }

    this.drawCustomText(); // Draw the text at its position
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        this.itemImage = img;
        this.applyChanges(); // Redraw the text on top of the image
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
  
  rotateText() {
    this.rotationAngle += 45; // Rotate the text by 45 degrees clockwise
    this.applyChanges(); // Reapply changes to update the canvas
  }

  saveCustomizedImage() {
    // Create a new canvas to hold the customized image
    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = this.canvas.nativeElement.width;
    imageCanvas.height = this.canvas.nativeElement.height;
    const imageContext = imageCanvas.getContext('2d');
  
    if (!imageContext) {
      console.error('Canvas context is null.');
      return;
    }
  
    // Draw the item image on the new canvas if available
    if (this.itemImage) {
      imageContext.drawImage(this.itemImage, 0, 0, imageCanvas.width, imageCanvas.height);
    }
  
    // Draw the custom image on the new canvas if available
    if (this.customImage) {
      imageContext.save();
      imageContext.translate(this.customImageX + this.customImageWidth, this.customImageY + this.customImageHeight);
      imageContext.rotate((this.rotationAngle * Math.PI) / 180);
      imageContext.drawImage(this.customImage, -this.customImageWidth, -this.customImageHeight, this.customImageWidth, this.customImageHeight);
      imageContext.restore();
    }
  
    // Draw the custom text on the new canvas
    imageContext.save();
    imageContext.translate(this.textX, this.textY);
    imageContext.rotate((this.rotationAngle * Math.PI) / 180);
    imageContext.font = `${this.textSize}px ${this.selectedFont}`;
    imageContext.fillStyle = this.textColor;
    imageContext.fillText(this.customText, 0, 0);
    imageContext.restore();
  
    // Convert the canvas content to an image URL
    const imageURL = imageCanvas.toDataURL('image/png');
  
    // Create an anchor element to initiate the download
    const downloadLink = document.createElement('a');
    downloadLink.href = imageURL;
    downloadLink.download = 'customized_image.png';
  
    // Simulate a click on the anchor element to trigger the download
    downloadLink.click();
  }
  

  handleCustomImageUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        this.customImage = img;
        this.applyChanges(); // Redraw the canvas with the custom image
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  drawCustomText() {
    this.context.save();
    this.context.translate(this.textX, this.textY);
    this.context.rotate((this.rotationAngle * Math.PI) / 180);
    this.context.font = `${this.textSize}px ${this.selectedFont}`;
    this.context.fillStyle = this.textColor;
    this.context.fillText(this.customText, 0, 0);
    this.context.restore();
  }

  drawCustomImage() {
    if (this.customImage) {
      this.customImageContext.save();
      this.customImageContext.translate(this.customImageX + this.customImageWidth / 2, this.customImageY + this.customImageHeight / 2);
      this.customImageContext.rotate((this.rotationAngle * Math.PI) / 180);
      this.customImageContext.drawImage(this.customImage, -this.customImageWidth / 2, -this.customImageHeight / 2, this.customImageWidth, this.customImageHeight);
      this.customImageContext.restore();
    }
  }

}
