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
        selectedSubjectIndexes: [],

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
            // Check if subject name and at least one time span is provided
            if (this.subjectName && this.times.length > 0) {
                // Validate time spans
                const isValid = this.times.every(time => {
                    const startHour = parseInt(time.start.split(':')[0]);
                    const startMinute = parseInt(time.start.split(':')[1]);
                    const endHour = parseInt(time.end.split(':')[0]);
                    const endMinute = parseInt(time.end.split(':')[1]);

                    // Check if start and end time are within the required hours (7 AM to 9:30 PM)
                    if (
                        (startHour < 7 || endHour < 7) ||
                        (startHour > 21 || endHour > 21) ||
                        (endHour === 21 && endMinute > 30)
                    ) {
                        alert(`Time span from ${time.start} to ${time.end} is outside the required hours (7 AM to 9:30 PM).`);
                        this.resetForm();
                        return false;
                    }

                    return true;
                });

                // If all time spans are valid, create the subject and add it to the subjects array
                if (isValid) {
                    const subject = {
                        name: this.subjectName,
                        times: [...this.times],
                        matrix: this.generateMatrix(this.times)
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

        generateMatrix(times) {
            const matrix = Array.from({ length: 30 }, () => Array(7).fill(0));

            times.forEach(time => {
                const startHour = parseInt(time.start.split(':')[0]);
                const startMinute = parseInt(time.start.split(':')[1]);
                const endHour = parseInt(time.end.split(':')[0]);
                const endMinute = parseInt(time.end.split(':')[1]);

                const startIndex = this.getTimeSlotIndex(startHour, startMinute);
                const endIndex = this.getTimeSlotIndex(endHour, endMinute);

                const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(time.day);

                for (let i = startIndex; i <= endIndex; i++) {
                    matrix[i][dayIndex] = 1;
                }
            });

            return matrix;
        },

        getTimeSlotIndex(hour, minute) {
            const totalMinutes = (hour - 7) * 60 + minute;
            return Math.floor(totalMinutes / 30);
        },

        optimize() {
            // Clear previous selection
            this.selectedSubjectIndexes = [];
            const subjectMatrices = {};

            // Group matrices by subject name and keep track of original indexes
            this.subjects.forEach((subject, index) => {
                if (!subjectMatrices[subject.name]) {
                    subjectMatrices[subject.name] = [];
                }
                subjectMatrices[subject.name].push({ matrix: subject.matrix, originalIndex: index });
            });

            // Generate all sum combinations of different subject matrices
            const validCombinations = this.generateCombinations(subjectMatrices);

            if (validCombinations.length > 0) {
                // Select a random combination
                const randomIndex = Math.floor(Math.random() * validCombinations.length);
                this.selectedSubjectIndexes = validCombinations[randomIndex].indexes;
                this.selectedCombination = validCombinations[randomIndex].matrix;
                
                // Provide feedback about the number of valid combinations
                alert(`Found ${validCombinations.length} valid combination(s). Displaying a random one.`);
            } else {
                alert('No valid combinations found. Try adjusting your schedule.');
            }

            return validCombinations;
        },

        generateCombinations(subjectMatrices) {
            const uniqueSubjectNames = Object.keys(subjectMatrices);
            const validCombinations = [];

            // Recursively generate all combinations
            this.backtrack(uniqueSubjectNames, 0, Array(30).fill().map(() => Array(7).fill(0)), [], validCombinations, subjectMatrices);

            return validCombinations;
        },

        backtrack(subjectNames, index, currentMatrix, currentIndexes, validCombinations, subjectMatrices) {
            if (index === subjectNames.length) {
                if (this.isValidMatrix(currentMatrix)) {
                    validCombinations.push({
                        matrix: currentMatrix.map(row => [...row]),
                        indexes: [...currentIndexes]
                    });
                }
                return;
            }

            const currentSubjectName = subjectNames[index];
            const currentSubjectMatrices = subjectMatrices[currentSubjectName];

            for (let i = 0; i < currentSubjectMatrices.length; i++) {
                const { matrix, originalIndex } = currentSubjectMatrices[i];
                for (let row = 0; row < 30; row++) {
                    for (let col = 0; col < 7; col++) {
                        currentMatrix[row][col] += matrix[row][col];
                    }
                }
                currentIndexes.push(originalIndex);

                this.backtrack(subjectNames, index + 1, currentMatrix, currentIndexes, validCombinations, subjectMatrices);

                currentIndexes.pop();
                for (let row = 0; row < 30; row++) {
                    for (let col = 0; col < 7; col++) {
                        currentMatrix[row][col] -= matrix[row][col];
                    }
                }
            }
        },

        isValidMatrix(matrix) {
            for (let i = 0; i < 30; i++) {
                for (let j = 0; j < 7; j++) {
                    if (matrix[i][j] > 1) {
                        return false;
                    }
                }
            }
            return true;
        },

        getSlotClass(day, slotIndex) {
            if (!this.selectedCombination) return '';
            
            const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
            
            if (this.selectedCombination[slotIndex][dayIndex] === 1) {
                return 'bg-zinc-400 text-center';
            }
            
            return '';
        },

        getSlotTitle(day, slotIndex) {
            if (!this.selectedCombination) return '';
            
            const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
            
            if (this.selectedCombination[slotIndex][dayIndex] === 1) {
                const subject = this.getSubjectForSlot(dayIndex, slotIndex);
                return subject ? subject.name : '';
            }
            
            return '';
        },

        getSlotText(day, slotIndex) {
            if (!this.selectedCombination) return '';
            
            const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(day);
            
            if (this.selectedCombination[slotIndex][dayIndex] === 1) {
                const subject = this.getSubjectForSlot(dayIndex, slotIndex);
                return subject ? subject.name : '';
            }
            
            return '';
        },

        getSubjectForSlot(dayIndex, slotIndex) {
            for (let subjectIndex of this.selectedSubjectIndexes) {
                const subject = this.subjects[subjectIndex];
                if (subject.matrix[slotIndex][dayIndex] === 1) {
                    return subject;
                }
            }
            return null;
        },
    }
}