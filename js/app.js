$(document).ready(function () {
    /*input number*/
    (function () {
        var inputNumber = $('[data-role="order-counter"]');
        var options = {
            labels: {
                up: "+",
                down: "-"
            }
        };

        //$.stepper("defaults", options);
        inputNumber.stepper();
        //console.log($.stepper);
    })();
});