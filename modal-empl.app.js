let strip = (string)=>{return string.replace(/^\s+|\s+$/g, '')}

// текущее время в формате timestamp
let timestamp = ()=>{return Math.floor(Date.now() / 1000)}

// Обработчик нажатия на кнопку любого пользователя
let userCtrl = (e)=>{
    // Определяем пункт назначения для прожатой кнопки по data аттрибуту utype
    let todayBlock = $(`.${$(e).data('utype')}-list-content-today`);
    // Так как кнопка что в левом, что в правом блоке используется одна и та же, проверяем на состояние по классу active
    // Если класс назначен, то пользователь на смене
    // Иначе возвращаем его в исходное состояние
    if (!$(e).hasClass('active')) {
        $(e).attr('data-start', `${timestamp()}`)
        $(e).addClass('active');
        // Пишем в базу текущий список сотрудников или при создании блока, проверяем существование записи для текущей смены
        // Если никто из сотрудников не назначен, то заменяем начинку блока кнопкой с информацией о пользователе, иначе дополняем
        (strip(todayBlock.text())==="Никто не назначен") ? todayBlock.html($(e)) : todayBlock.append($(e));
    } else {
        $(e).attr('data-end', `${timestamp()}`)
        $(e).removeClass('active');

        // Время между назначением и снятием пользователя со смены
        let awaitTime = 5
        if (($(e).data('end')-$(e).data('start'))>awaitTime) {
            // Тут передача данных в базу
            console.log(`write to base uid=${$(e).data('uid')}, user_type=${$(e).data('utype')} `)
            // write information about current employee start and end workday
            // Если сотрудник отработал больше чем указанный промежуток времени, нужно вносить информацию об этом в базу
        } else {
            // pass information about current employee
            // Это проверка на случйно добавленного работника, если сотруника добавили, а потом сняли со смены ранее чем через
            // усаноленный промежуток времени, учитываться этот сотрудник не будет
            console.log($(e).data('end')-$(e).data('start'))
        }

        // Возвращаем в исходное состояние (список слева)
        $(`.${$(e).data('utype')}-list-content`).prepend($(e));
        (!$('.active').length) ? todayBlock.text("Никто не назначен") : false;
    }
}


// Генерация списка пользователей
let testUserList = (utype,usersCount) => {
    $.get(`https://random-data-api.com/api/users/random_user?size=${usersCount}`).done(function(data){
        for (const key in data) {
            const user = data[key];
            // Шаблон кнопки для динамического добавления
            let BtnTemplate = $(`<div class="services__item" onclick="userCtrl(this)" data-utype="${utype}" data-uid="${user.id}">${user.first_name} ${user.last_name}</div>`);
            // Добавление
            $(`.${utype}-list-content`).append(BtnTemplate);
        }
    })
}

// init
$(function(){
    // Грузим помощников
    testUserList('helper', 6);
    // Грузим мастеров
    testUserList('master', 12);
    
    // Обработчик кнопки сохранить 
    $('.modal__button').click(function(){
        let currentEmpl = [];
        for (let index = 0; index < $('.active').length; index++) {
            const emplToday = $($('.active')[index]);
            empl = {uid: emplToday.data('uid'), utype: emplToday.data('utype'), start: emplToday.data('start'), end: emplToday.attr('data-end',`${timestamp()}`)}
            currentEmpl.push(empl);
        }
        console.log(currentEmpl);
    })
})