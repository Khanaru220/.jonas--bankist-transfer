'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const accounts = [
  {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
      '2019-11-18T21:31:17.178Z',

      '2019-12-23T07:42:02.383Z',
      '2020-01-28T09:15:04.904Z',
      '2020-04-01T10:17:24.185Z',
      '2021-11-29T14:11:59.604Z',
      '2021-12-10T17:01:17.194Z',
      '2021-12-15T00:36:17.929Z',
      // '2021-12-13T21:31:17.178Z',
      '2021-12-16T00:00:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
  },
  {
    owner: 'True Home',
    movements: [
      5000000, 3400000, -1500000, -790000, -3210000, -1000000, 8500000, -300000,
    ],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
      '2019-11-01T13:15:33.035Z',
      '2019-11-30T09:48:16.867Z',
      '2019-12-25T06:04:23.907Z',
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
      '2020-04-10T14:43:26.374Z',
      '2020-06-25T18:49:59.371Z',
      '2020-07-26T12:01:20.894Z',
    ],
    currency: 'VND',
    locale: 'vi',
  },
  {
    owner: 'John Doe',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 3333,

    movementsDates: [
      '2021-01-25T14:18:46.235Z',
      '2021-02-05T16:33:06.386Z',
      '2021-04-10T14:43:26.374Z',
      '2021-06-25T18:49:59.371Z',
      '2021-07-26T12:01:20.894Z',
      '2022-11-01T13:15:33.035Z',
      '2022-11-02T10:48:16.867Z',
      '2022-12-25T06:04:23.907Z',
    ],
    currency: 'USD',
    locale: 'en-US',
  },
];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const tootTipAccounts = document.querySelector('.tool-tip__account');

/////////////////////////////////////////////////
// Functions

// 0 function

const formatNum = (num, acc) => {
  const options = {
    style: 'currency',
    currency: acc.currency,
  };
  return new Intl.NumberFormat(acc.locale, options).format(num);
};

// 0.1 fucntion
const logout = () => {
  let fiveMin = 2 * 60;
  const countDown = () => {
    const min = String(Math.trunc(fiveMin / 60)).padStart(2, 0);
    const sec = String(fiveMin % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (fiveMin === 0) {
      clearInterval(count);
      console.log(`Time out !!!`);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    fiveMin--;
  };

  countDown();

  const count = setInterval(countDown, 1000);

  return count;
};

// 1 function
const displayMovements = function (acc) {
  containerMovements.innerHTML = '';

  acc.movements.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    // today - transferDay / convert milisecond to day

    const dateFromToday = Math.floor(
      (new Date() - new Date(acc.movementsDates[i])) / 1000 / 60 / 60 / 24
    );

    let displayDate;

    // 3 case: (in 30 days: 30 days ago) (<1: Today) (>30days: formatDate)
    if (dateFromToday <= 30 && dateFromToday > 1) {
      displayDate = `${dateFromToday} days ago`;
    } else if (dateFromToday === 0) displayDate = `TODAY`;
    else if (dateFromToday === 1) displayDate = `YESTERDAY`;
    else
      displayDate = new Intl.DateTimeFormat(acc.locale).format(
        new Date(acc.movementsDates[i])
      );

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatNum(mov, acc)}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//  2 function
const calcDisplayBalance = function (acc) {
  const sum = acc.movements.reduce((acc, cur) => acc + cur, 0);
  acc.balance = sum;
  labelBalance.textContent = formatNum(sum, acc);
};

// 3 function
const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  const outcomes = Math.abs(
    account.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  );

  // const interestRate = 1.2;
  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(deposit => deposit > 1)
    .reduce((acc, int) => acc + int, 0);
  // console.log(interest);

  // console.log(`income:${income}---outcome:${outcome}`);
  labelSumIn.textContent = formatNum(incomes, account);
  labelSumOut.textContent = formatNum(outcomes, account);
  labelSumInterest.textContent = formatNum(interest, account);
};

//  4 function
const createUserName = function (accs) {
  accs.map(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(v => v[0])
      .join('');
  });

  console.log(accs);
};

createUserName(accounts);
accounts.forEach(
  (acc, i) => (tootTipAccounts.innerText += ` (${acc.username}-${acc.pin})`)
);

// 4.1 function

const calcDisplayMaxLoan = function (acc) {
  // display Loan maximum
  document.querySelector(
    '.operation--loan h2'
  ).textContent = `Request loan (<= ${
    currentAccount.movements.reduce(
      (acc, mov) => (acc > mov ? acc : mov),
      currentAccount.movements[0]
    ) * 10
  })`;
};

// 4.2 function
const updateUI = function (acc) {
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
  displayMovements(acc);
  calcDisplayMaxLoan(acc);

  if (timer && dateCount) {
    clearInterval(timer);
    clearInterval(dateCount);
  }
  timer = logout();
  dateCount = displayClock(acc);
};

// 5 function
let currentAccount, timer, dateCount;

const login = function (username, pin) {
  const tryAccount = accounts.find(acc => acc.username === username);
  if (tryAccount) {
    if (tryAccount.pin === +pin) {
      // success + store login account
      console.log('🟢 Successed login');
      currentAccount = tryAccount;
      // display UI + welcome message
      containerApp.style.opacity = 1;
      labelWelcome.textContent = `Welcome back, ${
        currentAccount.owner.split(' ')[0]
      }`;
      updateUI(currentAccount);
      // Run logout() -- trigget Timeer

      // reset input field
      inputLoginUsername.value = '';
      inputLoginPin.value = '';
      inputLoginPin.blur();
    } else console.log('🔢 Wrong PIN');
  } else console.log('😶 User not exist');
};

btnLogin.addEventListener('click', e => {
  e.preventDefault();
  login(inputLoginUsername.value, inputLoginPin.value);
});

// 6 function
const transfer = function (username, amount) {
  const accReceive = accounts.find(acc => acc.username === username);
  // username exist | not current | amount !=== 0
  if (accReceive) {
    if (accReceive !== currentAccount) {
      if (+amount > 0 && +amount <= currentAccount.balance) {
        // display success
        console.log('🟢 Successed tranfer');
        // push movements to 2 acc
        accReceive.movements.push(+amount);
        currentAccount.movements.push(-amount);
        // push movementsDate to 2 acc
        accReceive.movementsDates.push(new Date().toISOString());
        currentAccount.movementsDates.push(new Date().toISOString());
        // update UI
        updateUI(currentAccount);

        // reset field
        inputTransferTo.value = inputTransferAmount.value = '';
        inputTransferAmount.blur();
      } else console.log('ERROR amount');
    } else console.log('🤯 Same account');
  } else console.log('😶 User not exist');
};

btnTransfer.addEventListener('click', e => {
  e.preventDefault();
  transfer(inputTransferTo.value, inputTransferAmount.value);
});

// 7 function
const closeAcc = function (username, pin) {
  const tryAccount = accounts.find(acc => acc.username === username);

  if (tryAccount) {
    if (tryAccount.pin === +pin) {
      // success
      console.log('🟢 Successed delete');
      // BONUS: display UI +  bye mess if (same current acc)
      if (currentAccount === tryAccount) {
        containerApp.style.opacity = 0.1;
        labelWelcome.textContent = `😿 Hope to see you back, ${
          currentAccount.owner.split(' ')[0]
        }`;
      }
      // delete acc from accouns list
      const indexTryAccount = accounts.findIndex(
        acc => acc.username === username
      );
      accounts.splice(indexTryAccount, 1);
      console.log(
        'Remaining accounts:',
        accounts.map(acc => acc.username)
      );

      // reset input field
      inputCloseUsername.value = inputClosePin.value = '';
      inputClosePin.blur();
    } else console.log('🔢 Wrong PIN');
  } else console.log('😶 User not exist');
};

btnClose.addEventListener('click', e => {
  e.preventDefault();
  closeAcc(inputCloseUsername.value, inputClosePin.value);
});

// 8 function
const loan = function (amount) {
  let timeApproveLoan = 2; //secs
  // check condition deposit >= 10% request
  if (amount > 0 && currentAccount.movements.some(mov => mov >= 0.1 * amount)) {
    console.log(`😪 Approval waiting ...`);
    const count = setInterval(() => {
      if (timeApproveLoan == 0) {
        clearInterval(count);
        currentAccount.movements.push(Math.floor(amount));
        currentAccount.movementsDates.push(new Date().toISOString());

        updateUI(currentAccount);
        console.log(`🟢 Successed loan`);
      } else console.log(timeApproveLoan);
      timeApproveLoan--;
    }, 1000);
    inputLoanAmount.value = '';
    inputLoanAmount.blur();
    // reset input field
  } else console.log(`Not enought requirement 🧧`);
};

btnLoan.addEventListener('click', e => {
  e.preventDefault();
  loan(inputLoanAmount.value);
});

// 9 function
let stateSort = 0;

const sortMoves = function (acc) {
  const sortedMovements = [...acc.movements].sort((a, b) => (a > b ? 1 : -1));
  const sortedMovementsDate = sortedMovements
    .map(mov => acc.movements.indexOf(mov))
    .map(i => acc.movementsDates[i]);

  displayMovements({
    movements: stateSort === 0 ? sortedMovements : acc.movements,
    movementsDates: stateSort === 0 ? sortedMovementsDate : acc.movementsDates,
    currency: acc.currency,
    locale: acc.locale,
  });
  stateSort = stateSort === 0 ? 1 : 0;
};

btnSort.addEventListener('click', () => {
  sortMoves(currentAccount);
});

// 10 function
const displayClock = acc => {
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  };

  const tick = () => {
    labelDate.textContent = new Intl.DateTimeFormat(acc.locale, options).format(
      new Date()
    );
  };

  tick();

  const dateCount = setInterval(tick, 1000);

  return dateCount;
};

// const day = `${date.getDate()}`.padStart(2, 0);
// const month = `${date.getMonth() + 1}`.padStart(2, 0);
// const year = date.getFullYear();
// return [day, month, year].join('/');

// --------------------------------

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// FAKE LOGGED IN
// login('js', '1111');

//
