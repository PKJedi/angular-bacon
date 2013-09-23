angular.
    module('example', ['angular-bacon']).
    controller('form', function($scope) {
        $scope.username = ''

        var greaterThan = function(num) {
            return function(it) {
                return it && it.length > num;
            }
        }
        var greaterThanOrEqual = function(num) {
            return function(it) {
                return it && it.length >= num;
            }
        }
        var lowerThan = function (num) {
            return function (it) {
                return it && it.length < num;
            }
        }
        var identity = function(it) {
            return it;
        }
        var passwordInput = $scope
                .$watchAsProperty('password')

        var passwordsEqual = passwordInput
                .combine(
                    $scope.$watchAsProperty('passwordConfirm'),
                    function(pass, confirm) {
                        return {
                            password: pass,
                            confirm: confirm
                        }
                    }
                )
                .map(function(it) {
                    return it.password === it.confirm
                })
                .toProperty()

        var usernameInput = $scope
                .$watchAsProperty('username')

        var passwordIsValid = passwordInput
                .map(greaterThanOrEqual(5))

        var usernameIsFree = usernameInput
                .changes()
                .filter(greaterThan(2))
                .flatMapLatest(function(it) { return Bacon.later(2000, it === "user"); })
                .merge(usernameInput.map(false))
                .toProperty(false)

        usernameIsFree
            .and(passwordIsValid)
            .and(passwordsEqual)
            .digest($scope, 'formValid')

        usernameIsFree
            .changes()
            .filter(identity)
            .map(Bacon.constant("free"))
            .merge(usernameIsFree.changes().not().filter(identity).map(Bacon.constant("taken")))
            .merge(usernameInput.map(Bacon.constant("loading")))
            .merge(
                usernameInput
                    .filter(lowerThan(2))
                    .map(Bacon.constant("empty"))
                )
            .digest($scope, 'usernameState')

        passwordIsValid
            .changes()
            .not()
            .digest($scope, 'passwordInvalid')

        passwordsEqual
            .changes()
            .not()
            .digest($scope, 'passwordsDontMatch')

    })
