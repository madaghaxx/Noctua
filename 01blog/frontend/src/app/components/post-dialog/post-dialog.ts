import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { PostService } from '../../services/post.service';
import { Post, CreatePostRequest, UpdatePostRequest } from '../../models/post.model';

@Component({
  selector: 'app-post-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './post-dialog.html',
  styleUrls: ['./post-dialog.scss'],
})
export class PostDialogComponent implements OnInit {
  postForm: FormGroup;
  isEditMode = false;
  loading = false;
  selectedFiles: File[] = [];
  mediaPreview: string[] = [];
  existingMedia: string[] = [];

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private dialogRef: MatDialogRef<PostDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { post?: Post }
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      status: ['PUBLISHED'],
    });
  }

  ngOnInit() {
    if (this.data?.post) {
      this.isEditMode = true;
      this.postForm.patchValue({
        title: this.data.post.title,
        content: this.data.post.content,
        status: this.data.post.status || 'PUBLISHED',
      });
      this.existingMedia = this.data.post.mediaUrls || [];
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedFiles.push(...files);

      // Create preview for images
      files.forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.mediaPreview.push(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.mediaPreview.splice(index, 1);
  }

  removeExistingMedia(index: number) {
    this.existingMedia.splice(index, 1);
  }

  onSubmit() {
    if (this.postForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.postForm.value;

    if (this.isEditMode && this.data.post) {
      const updateRequest: UpdatePostRequest = {
        title: formValue.title,
        content: formValue.content,
        status: formValue.status,
      };

      this.postService.updatePost(this.data.post.id, updateRequest).subscribe({
        next: (post) => {
          this.uploadMedia(post.id);
        },
        error: (error) => {
          console.error('Error updating post:', error);
          this.loading = false;
          alert('Failed to update post');
        },
      });
    } else {
      const createRequest: CreatePostRequest = {
        title: formValue.title,
        content: formValue.content,
        status: formValue.status,
      };

      this.postService.createPost(createRequest).subscribe({
        next: (post) => {
          this.uploadMedia(post.id);
        },
        error: (error) => {
          console.error('Error creating post:', error);
          this.loading = false;
          alert('Failed to create post');
        },
      });
    }
  }

  uploadMedia(postId: string) {
    if (this.selectedFiles.length === 0) {
      this.loading = false;
      this.dialogRef.close(true);
      return;
    }

    let uploadedCount = 0;
    const totalFiles = this.selectedFiles.length;

    this.selectedFiles.forEach((file) => {
      this.postService.uploadMedia(postId, file).subscribe({
        next: () => {
          uploadedCount++;
          if (uploadedCount === totalFiles) {
            this.loading = false;
            this.dialogRef.close(true);
          }
        },
        error: (error) => {
          console.error('Error uploading media:', error);
          uploadedCount++;
          if (uploadedCount === totalFiles) {
            this.loading = false;
            this.dialogRef.close(true);
          }
        },
      });
    });
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
