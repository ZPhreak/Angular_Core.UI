import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Gender } from 'src/app/models/ui-models/gender.model';
import { Student } from 'src/app/models/ui-models/student.model';
import { GenderService } from 'src/app/services/gender.service';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.css'],
})
export class ViewStudentComponent implements OnInit {
  studentId: string | null | undefined;
  student: Student = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    mobile: 0,
    genderId: '',
    profileImageUrl: '',
    gender: {
      id: '',
      description: '',
    },
    address: {
      id: '',
      physicalAddress: '',
      postalAddress: '',
    },
  };
  isNewStudent = false;
  header = '';
  displayProfileImageUrl = '';

  genderList: Gender[] = [];
  @ViewChild('studentDetailsForm') studentDetailsForm?: NgForm;

  constructor(
    private readonly studentService: StudentService,
    private readonly route: ActivatedRoute,
    private readonly genderService: GenderService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.studentId = params.get('id');

      /**
       * If the round contains the keyword 'add', then we create a new student
       */
      if (this.studentId) {
        if (this.studentId.toLocaleLowerCase() === 'add') {
          // New student
          this.isNewStudent = true;
          this.header = 'Add New Student';
          this.setImage();
        } else {
          // Existing student
          this.header = 'Edit Student';
          this.isNewStudent = false;
          this.studentService.getStudent(this.studentId).subscribe(
            (successResponse) => {
              this.student = successResponse;
              this.setImage();
            },
            (errorResponse) => {
              this.setImage();
            }
          );
        }
        this.genderService.getGenderList().subscribe((successResponse) => {
          this.genderList = successResponse;
        });
      }
    });
  }

  onUpdate(): void {
    if (this.studentDetailsForm?.form.valid) {
      this.studentService
        .updateStudent(this.student.id, this.student)
        .subscribe(
          (successResponse) => {
            // Show a notification
            this.snackbar.open('Student updated successfully!', undefined, {
              duration: 2000,
            });
          },
          (errorResponse) => {
            console.log(errorResponse);
            // Log it
          }
        );
    }
  }

  onDelete(): void {
    this.studentService.deleteStudent(this.student.id).subscribe(
      (successResponse) => {
        this.snackbar.open('Student deleted successfully!', undefined, {
          duration: 2000,
        });

        setTimeout(() => {
          this.router.navigateByUrl('students');
        }, 2000);
      },
      (errorResponse) => {
        console.log(errorResponse);
        // Log it
      }
    );
  }

  onAdd(): void {
    if (this.studentDetailsForm?.form.valid) {
      // Form is valid, submit to Api
      this.studentService.addStudent(this.student).subscribe(
        (successResponse) => {
          console.log(successResponse);
          this.snackbar.open('Student added successfully!', undefined, {
            duration: 2000,
          });

          setTimeout(() => {
            this.router.navigateByUrl(`students/${successResponse.id}`);
          }, 2000);
        },
        (errorResponse) => {
          console.log(errorResponse);
          // Log it
        }
      );
    }
  }

  uploadImage(event: any): void {
    if (this.studentId) {
      console.log('this.student.id', this.student.id);
      const file = event.target.files[0];
      this.studentService.uploadImage(this.student.id, file).subscribe(
        (successResponse) => {
          console.log(successResponse);
          this.student.profileImageUrl = successResponse;
          this.setImage();
          this.snackbar.open('Image updated successfully!', undefined, {
            duration: 2000,
          });

          setTimeout(() => {
            this.router.navigateByUrl(`students/${successResponse.id}`);
          }, 2000);
        },
        (errorResponse) => {
          console.log('errorResponse', errorResponse);
        }
      );
    }
  }

  private setImage(): void {
    if (this.student.profileImageUrl) {
      // Fetch image by URL
      this.displayProfileImageUrl = this.studentService.getImagePath(
        this.student.profileImageUrl
      );
    } else {
      // Display default image
      this.displayProfileImageUrl = '/assets/default-student.jpg';
    }
  }
}
