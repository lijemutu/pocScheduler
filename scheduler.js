function scheduler() {
    return {
        showModal: false,
        subjectName: '',
        selectedDay: '',
        startTime: '',
        endTime: '',
        times: [],
        subjects: [],
        editIndex: null,

        addTimeSpan() {
            if (this.selectedDay && this.startTime && this.endTime) {
                this.times.push({ day: this.selectedDay, start: this.startTime, end: this.endTime });
                this.selectedDay = '';
                this.startTime = '';
                this.endTime = '';
            }
        },

        formatTimeSpan(time) {
            return `${time.start} - ${time.end}`;
        },

        saveSubject() {
            if (this.subjectName && this.times.length > 0) {
                const subject = {
                    name: this.subjectName,
                    times: [...this.times]
                };

                if (this.editIndex !== null) {
                    this.subjects[this.editIndex] = subject;
                    this.editIndex = null;
                } else {
                    this.subjects.push(subject);
                }

                this.resetForm();
                this.showModal = false;
            }
        },

        editSubject(index) {
            this.editIndex = index;
            const subject = this.subjects[index];
            this.subjectName = subject.name;
            this.times = [...subject.times];
            this.showModal = true;
        },

        resetForm() {
            this.subjectName = '';
            this.startTime = '';
            this.endTime = '';
            this.times = [];
            this.editIndex = null;
        },

        formatTimesWithDay(time) {
            return `${time.day}: ${time.start} - ${time.end}`;
        },

        formatTimesWithDayList(times) {
            return times.map(time => `${time.day}: ${time.start} - ${time.end}`).join(' - ');
        },

        deleteSubject(index) {
            if (confirm('Are you sure you want to delete this subject?')) {
                this.subjects.splice(index, 1);
            }
        },

        deleteTimeSpan(index) {
            this.times.splice(index, 1);
        },

        optimize() {

        }
    }
}