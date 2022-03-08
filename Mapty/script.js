'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class workout {
  type;
  click = 0;
  data = new Date();
  id = (Date.now() + ' ').slice(-10);
  constructor(coords, duration, distance) {
    this.coords = coords;
    this.duration = duration;
    this.distance = distance;
  }
  timeDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toLocaleUpperCase()}${this.type.slice(
      1
    )} on ${months[this.data.getMonth()]}${this.data.getDay()} `;
  }
  clicked() {
    this.click++;
  }
}

class running extends workout {
  type = 'running';
  constructor(coords, duration, distance, cadence) {
    // ايقاع
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calPace();
    this.timeDescription();
  }

  calPace() {
    //حساب كام خطوة فا الوقت على المسافة
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class cycling extends workout {
  type = 'cycling';
  constructor(coords, duration, distance, elevation) {
    // الارتفاع
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calspeed();
    this.timeDescription();
  }

  calspeed() {
    //حساب المسافة على الوقت عشان اشوف طلعت الجبل فى اد اية والوقت هنا بالسعات فا هقسم على  60
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

class App {
  workouts = [];
  map;
  mapZoom = 13;
  mapEvent;
  constructor() {
    this.get_position();
    inputType.addEventListener('change', this.changeInputs);
    form.addEventListener('submit', this.submitNewWorkout.bind(this));

    //use event delegation when i click on the container i get reault
    containerWorkouts.addEventListener('click', this.MoveTOworkout.bind(this));
  }

  get_position() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.loadMap.bind(this),
        function () {
          alert('can not get ur pos');
        }
      );
    }
  }
  loadMap(pos) {
    const { latitude } = pos.coords;
    const { longitude } = pos.coords;
    const coords = [latitude, longitude];
    this.map = L.map('map').setView(coords, this.mapZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on('click', this.clickOnMap.bind(this));
  }

  clickOnMap(event) {
    this.mapEvent = event;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  submitNewWorkout(e) {
    //check number are postive and are numbers
    e.preventDefault();
    const isPositiveNumber = (...inputs) => inputs.every(inp => inp > 0);
    const isNumber = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const { lat, lng } = this.mapEvent.latlng;
    const coords = [lat, lng];
    const type = inputType.value;
    const distance = Number(inputDistance.value);
    const duration = +inputDuration.value;
    let workout;
    // if type is running check if number positive and make running obj
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !isPositiveNumber(cadence, distance, duration) ||
        !isNumber(cadence, distance, duration)
      )
        return alert('please enter valid number');
      workout = new running([lat, lng], duration, distance, cadence);
    }

    // if type is cycling check if number positive and make cycling obj
    if (type === 'cycling') {
      const evlation = +inputElevation.value;
      if (
        !isPositiveNumber(evlation, distance, duration) ||
        !isNumber(evlation, distance, duration)
      )
        return alert('please enter valid number');
      workout = new cycling([lat, lng], duration, distance, evlation);
    }

    this.workouts.push(workout); // push in array
    console.log(workout.description);
    console.log(this.workouts);

    //mark this array
    this.marker(coords, workout); //do not use bind coz i did not use form or add event

    // create workout and display them
    this.createWorkout(workout);
    //clear the submint
    this.hideForm();
  }

  hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    form.classList.add('hidden');
    form.style.display = 'none'; 
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  createWorkout(workout) {
    //get the html that the 2 workouts have in common
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id //each html has diff id using data-id >> if i want to get it use workout.dataset.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon"> 
      ${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if (workout.type === 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }

    if (workout.type === 'cycling') {
      html += ` <div class="workout__details">
     <span class="workout__icon">⚡️</span>
     <span class="workout__value">${workout.speed.toFixed(1)}</span>
     <span class="workout__unit">km/h</span>
   </div>
   <div class="workout__details">
     <span class="workout__icon">⛰</span>
     <span class="workout__value">${workout.elevation}</span>
     <span class="workout__unit">m</span>
   </div>
 </li>`;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  marker(coords, workout) {
    L.marker(coords)
      .addTo(this.map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`
      )
      .openPopup();
  }
  changeInputs() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  MoveTOworkout(e) {
    const clicked = e.target.closest('.workout');
    // console.log(clicked);
    if (!clicked) return;
    //here get the workout i cliked from the workouts array
    const workout = this.workouts.find(work => work.id === clicked.dataset.id);
    // console.log(workout);
    this.map.setView(workout.coords, this.mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    workout.clicked();
    console.log(workout);
  }
}

const app = new App();
