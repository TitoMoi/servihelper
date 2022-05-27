//   /**
//    * Prepare the only woman subscription
//    */
//    onlyWomanSubscription() {
//     this.onlyWomanSub$ = this.getOnlyWomanControl().valueChanges.subscribe(
//       (isChecked) => {
//         const onlyManControl = this.getOnlyManControl();

//         if (!isChecked) {
//           this.principalList = this.participantService.getParticipants(true);
//           onlyManControl.enable({ emitEvent: false });
//           this.assignmentForm.get("principal").reset(undefined);
//           return;
//         }
//         this.principalList = setListToOnlyWomen(
//           this.participantService.getParticipants(true)
//         );
//         onlyManControl.disable({ emitEvent: false });

//         this.assignmentForm.get("principal").reset(undefined);
//       }
//     );
//   }

//   /**
//    * Prepare the only man subscription
//    */
//   onlyManSubscription() {
//     this.onlyManSub$ = this.getOnlyManControl().valueChanges.subscribe(
//       (isChecked) => {
//         const onlyWomanControl = this.getOnlyWomanControl();

//         if (!isChecked) {
//           this.principalList = this.participantService.getParticipants(true);
//           onlyWomanControl.enable({ emitEvent: false });
//           this.assignmentForm.get("principal").reset(undefined);
//           return;
//         }
//         this.principalList = setListToOnlyMen(
//           this.participantService.getParticipants(true)
//         );
//         onlyWomanControl.disable({ emitEvent: false });
//         this.assignmentForm.get("principal").reset(undefined);
//       }
//     );
//   }

//   /**
//    * Prepare the assignType subscription
//    * @returns Observable<boolean> that emits when ends the observer
//    */
//   assignTypeSubscription() {
//     this.assignTypeSub$ = this.getAssignTypeControl().valueChanges.subscribe(
//       (assignTypeValue) => {
//         const roomControl = this.getRoomControl();
//         const principalControl = this.getPrincipalControl();

//         if (assignTypeValue && roomControl.value) {
//           const onlyWomanControl = this.getOnlyWomanControl();
//           const onlyManControl = this.getOnlyManControl();

//           this.tryToEnableGenderControls();

//           //Mandatory to get them every time
//           this.principalList = this.participantService.getParticipants();

//           for (const participant of this.principalList) {
//             const isAvailable = checkIsPrincipalAvailable(
//               participant,
//               assignTypeValue,
//               roomControl.value
//             );

//             this.filterPrincipalsByAvailable(participant, isAvailable);
//           }

//           setCount(
//             this.assignments,
//             this.principalList,
//             roomControl.value,
//             assignTypeValue,
//             true
//           );

//           /* onlyWoman and onlyMan are enabled after room and assignType so its not possible to have values.
//           This scenario is when onlyWoman or onlyMan is checked and the user wants to change the current room. */
//           if (onlyWomanControl.value) {
//             this.principalList = setListToOnlyWomen(this.principalList);
//           }
//           if (onlyManControl.value) {
//             this.principalList = setListToOnlyMen(this.principalList);
//           }
//           this.principalList.sort(sortParticipantsByCount);

//           /* This means we have principal selected and updating assignType
//           so we force the principal subscription to affect the assistants */
//           if (!principalControl.disabled) {
//             principalControl.setValue(principalControl.value);
//           } else {
//             principalControl.enable({ emitEvent: false });
//           }
//           this.canContinueSub$.next(true);
//         }
//       }
//     );
//   }

//   /**
//    * Prepare the room subscription
//    */
//   roomSubscription() {
//     this.roomSub$ = this.getRoomControl().valueChanges.subscribe(
//       (roomValue) => {
//         const assignTypeControl = this.getAssignTypeControl();
//         const principalControl = this.getPrincipalControl();

//         if (roomValue && assignTypeControl.value) {
//           const onlyWomanControl = this.getOnlyWomanControl();
//           const onlyManControl = this.getOnlyManControl();

//           this.tryToEnableGenderControls();

//           //Mandatory to get them every time
//           this.principalList = this.participantService.getParticipants();

//           for (const participant of this.principalList) {
//             const isAvailable = checkIsPrincipalAvailable(
//               participant,
//               assignTypeControl.value,
//               roomValue
//             );

//             this.filterPrincipalsByAvailable(participant, isAvailable);
//           }

//           setCount(
//             this.assignments,
//             this.principalList,
//             roomValue,
//             assignTypeControl.value,
//             true
//           );

//           /* onlyWoman and onlyMan are enabled after room and assignType so its not possible to have values.
//           This scenario is when onlyWoman or onlyMan is checked and the user wants to change the current room. */
//           if (onlyWomanControl.value) {
//             this.principalList = setListToOnlyWomen(this.principalList);
//           }
//           if (onlyManControl.value) {
//             this.principalList = setListToOnlyMen(this.principalList);
//           }

//           this.principalList.sort(sortParticipantsByCount);

//           /* This means we have principal selected and updating room
//           so we force the principal subscription to affect the assistants */
//           if (!principalControl.disabled) {
//             principalControl.setValue(principalControl.value);
//           } else {
//             principalControl.enable({ emitEvent: false });
//           }
//         }
//       }
//     );
//   }

//   /**
//    * Prepare the principal subscription
//    */
//   principalSubscription() {
//     this.principalSub$ = this.getPrincipalControl().valueChanges.subscribe(
//       (principalId) => {
//         const assistantControl = this.getAssistantControl();

//         if (!principalId) {
//           assistantControl.reset(undefined, { emitEvent: false });
//           assistantControl.disable({ emitEvent: false });
//           return;
//         }
//         const roomControl = this.getRoomControl();
//         const assignTypeControl = this.getAssignTypeControl();

//         this.assistantList = this.participantService.getParticipants();

//         //Remove principal from the list of assistants
//         this.assistantList = this.assistantList.filter(
//           (b) => b.id !== principalId
//         );

//         for (const participant of this.assistantList) {
//           const isAvailable = checkIsAssistantAvailable(
//             participant,
//             assignTypeControl.value,
//             roomControl.value
//           );

//           this.filterAssistantsByAvailable(participant, isAvailable);
//         }

//         //the current count is of the principal, we need to calculate again for the assistant
//         setCount(
//           this.assignments,
//           this.assistantList,
//           roomControl.value,
//           assignTypeControl.value,
//           false
//         );

//         this.assistantList.sort(sortParticipantsByCount);

//         assistantControl.enable({ emitEvent: false });

//         //Check if participant has more assignments for the date
//         this.hasAssignmentsList = [];

//         let assignments =
//           this.assignmentService.findPrincipalAssignmentsByParticipantId(
//             principalId
//           );
//         //Filter the date
//         const dateControl = this.getDateControl();
//         assignments = assignments.filter(
//           (assignment) =>
//             new Date(dateControl.value).getDate() ===
//             new Date(assignment.date).getDate()
//         );
//         //Get name
//         for (const assignment of assignments) {
//           const assignTypeName = this.assignTypeService.getAssignTypeNameById(
//             assignment.assignType
//           );
//           this.hasAssignmentsList.push(assignTypeName);
//         }
//       }
//     );
//   }

//   /**
//    * prepare the assitant change subscription
//    *
//    */
//   assistantSubscription() {
//     this.assistantSub$ = this.getAssistantControl().valueChanges.subscribe(
//       (assistantId) => {
//         //Check if assistant has more assignments for the date
//         this.hasAssignmentsAssistantList = [];

//         let assignments =
//           this.assignmentService.findAssistantAssignmentsByParticipantId(
//             assistantId
//           );
//         //Filter the date
//         const dateControl = this.getDateControl();
//         assignments = assignments.filter(
//           (assignment) =>
//             new Date(dateControl.value).getDate() ===
//             new Date(assignment.date).getDate()
//         );
//         //Get name
//         for (const assignment of assignments) {
//           const assignTypeName = this.assignTypeService.getAssignTypeNameById(
//             assignment.assignType
//           );
//           this.hasAssignmentsAssistantList.push(assignTypeName);
//         }
//       }
//     );
//   }

//   /** ???
//    * If a gender control is active respect the current values, else activate the controls
//    */
//    tryToEnableGenderControls() {
//     const onlyWomanControl = this.getOnlyWomanControl();
//     const onlyManControl = this.getOnlyManControl();
//     if (!onlyWomanControl.value && !onlyManControl.value) {
//       onlyWomanControl.enable({ emitEvent: false });
//       onlyManControl.enable({ emitEvent: false });
//     }
//   }
