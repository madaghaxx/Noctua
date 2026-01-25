import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SocialService } from '../../services/social.service';
import { CommentResponse } from '../../models/social.model';
import { AuthService } from '../../services/auth.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-comment-section',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    TimeAgoPipe,
  ],
  templateUrl: './comment-section.html',
  styleUrl: './comment-section.scss',
})
export class CommentSectionComponent implements OnInit {
  @Input() postId!: string;

  commentForm: FormGroup;
  comments: CommentResponse[] = [];
  currentUserId: string | null = null;
  loading = false;
  submitting = false;
  editingCommentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private socialService: SocialService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUserId = user?.id || null;
      this.cdr.detectChanges();
    });

    // Load comments immediately and force change detection
    this.loading = true;
    this.cdr.detectChanges();
    this.loadComments();
  }

  loadComments(): void {
    this.loading = true;
    this.cdr.detectChanges();
    this.socialService.getComments(this.postId).subscribe({
      next: (response) => {
        this.comments = response.content;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  submitComment(): void {
    if (this.commentForm.invalid) return;

    this.submitting = true;
    if (this.editingCommentId) {
      this.socialService
        .updateComment(this.postId, this.editingCommentId, this.commentForm.value)
        .subscribe({
          next: (updatedComment) => {
            const index = this.comments.findIndex((c) => c.id === this.editingCommentId);
            if (index !== -1) {
              this.comments[index] = updatedComment;
            }
            this.resetForm();
            this.submitting = false;
          },
          error: () => {
            this.submitting = false;
          },
        });
    } else {
      this.socialService.createComment(this.postId, this.commentForm.value).subscribe({
        next: (comment) => {
          this.comments.unshift(comment);
          this.resetForm();
          this.submitting = false;
        },
        error: () => {
          this.submitting = false;
        },
      });
    }
  }

  editComment(comment: CommentResponse): void {
    this.editingCommentId = comment.id;
    this.commentForm.patchValue({ content: comment.content });
  }

  deleteComment(commentId: string): void {
    if (!confirm('Delete this comment?')) return;

    this.socialService.deleteComment(this.postId, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c.id !== commentId);
      },
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.commentForm.reset();
    this.editingCommentId = null;
  }

  canModify(comment: CommentResponse): boolean {
    return this.currentUserId === comment.userId;
  }
}
