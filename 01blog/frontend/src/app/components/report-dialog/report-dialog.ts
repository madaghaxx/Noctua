import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './report-dialog.html',
  styleUrls: ['./report-dialog.scss'],
})
export class ReportDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ReportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { postId: string }
  ) {
    this.form = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(100)]],
      details: ['', [Validators.maxLength(500)]],
    });
  }

  submit() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
