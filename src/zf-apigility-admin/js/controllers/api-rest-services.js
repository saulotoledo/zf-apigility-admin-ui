(function(_) {
    'use strict';

angular.module('ag-admin').controller(
  'ApiRestServicesController', 
  function ($scope, $state, $stateParams, $sce, flash, filters, hydrators, validators, selectors, ApiRepository, api, dbAdapters, toggleSelection) {

    $scope.activeService     = $stateParams.service ? $stateParams.service : '';
    $scope.inEdit            = !!$stateParams.edit;
    $scope.view              = $stateParams.view ? $stateParams.view : 'settings';
    $scope.ApiRepository     = ApiRepository; // used in child controller (input filters)
    $scope.flash             = flash;
    $scope.api               = api;
    $scope.dbAdapters        = dbAdapters;
    $scope.filterOptions     = filters;
    $scope.hydrators         = hydrators;
    $scope.validatorOptions  = validators;
    $scope.selectors         = selectors;
    $scope.sourceCode        = [];
    $scope.deleteRestService = false;
    $scope.toggleSelection   = toggleSelection;
    $scope.newService        = {
        restServiceName: '',
        dbAdapterName:   '',
        dbTableName:     ''
    };

    $scope.resetForm = function () {
        $scope.$broadcast('ag-form-submit-complete');
        $scope.$broadcast('ag-form-validation-errors-clear');
        $scope.showNewRestServiceForm     = false;
        $scope.newService.restServiceName = '';
        $scope.newService.dbAdapterName   = '';
        $scope.newService.dbTableName     = '';
    };

    $scope.isLatestVersion = function () {
        return $scope.ApiRepository.isLatestVersion($scope.api);
    };
    if (!$scope.isLatestVersion()) {
        $scope.inEdit = false;
        $state.go($state.$current.name, {edit: ''}, {reload: true});
    }

    $scope.isDbConnected = function (restService) {
        if (typeof restService !== 'object' || typeof restService === 'undefined') {
            return false;
        }
        if (restService.hasOwnProperty('adapter_name') || restService.hasOwnProperty('table_name') || restService.hasOwnProperty('table_service')) {
            return true;
        }
        return false;
    };

    $scope.newService.createNewRestService = function () {
        ApiRepository.createNewRestService($scope.api.name, $scope.newService.restServiceName).then(
            function (restResource) {
                $scope.resetForm();
                ApiRepository.refreshApi($scope, $state, true, 'New REST Service created');
            },
            function (error) {
                $scope.$broadcast('ag-form-submit-complete');

                if (error.status !== 400 && error.status !== 422) {
                    /* generic, non-validation related error! */
                    flash.error = 'Error submitting new API';
                    return;
                }

                var validationErrors;

                if (error.status === 400) {
                    validationErrors = [ 'Unexpected or missing data processing form' ];
                } else {
                    validationErrors = error.data.validation_messages;
                }

                $scope.$broadcast('ag-form-validation-errors', validationErrors);
                flash.error = 'We were unable to validate your form; please check for errors.';
            }
        );
    };

    $scope.newService.createNewDbConnectedService = function () {
        ApiRepository.createNewDbConnectedService($scope.api.name, $scope.newService.dbAdapterName, $scope.newService.dbTableName).then(
            function (restResource) {
                $scope.resetForm();
                ApiRepository.refreshApi($scope, $state, true, 'New DB Connected Service created');
            },
            function (error) {
                $scope.$broadcast('ag-form-submit-complete');

                if (error.status !== 400 && error.status !== 422) {
                    /* generic, non-validation related error! */
                    flash.error = 'Error submitting new API';
                    return;
                }

                var validationErrors;

                if (error.status === 400) {
                    validationErrors = [ 'Unexpected or missing data processing form' ];
                } else {
                    validationErrors = error.data.validation_messages;
                }

                $scope.$broadcast('ag-form-validation-errors', validationErrors);
                flash.error = 'We were unable to validate your form; please check for errors.';
            }
        );
    };

    $scope.cancelEdit = function () {
        $state.go($state.$current.name, {edit: ''}, {reload: true, inherit: true});
    };

    $scope.startEdit = function () {
        $state.go($state.$current.name, {edit: true}, {notify: true, inherit: true});
    };

    $scope.saveRestService = function (index) {
        var restServiceData = _.clone($scope.api.restServices[index]);
        ApiRepository.saveRestService($scope.api.name, restServiceData)
            .then(function (data) {
                ApiRepository.refreshApi($scope, $state, true, 'REST Service updated', function () {
                    $scope.cancelEdit();
                });
            });
    };

    $scope.removeRestService = function (restServiceName) {
        ApiRepository.removeRestService($scope.api.name, restServiceName)
            .then(function (data) {
                ApiRepository.refreshApi($scope, $state, true, 'REST Service deleted');
                $scope.deleteRestService = false;
            });
    };

    $scope.getSourceCode = function (className, classType) {
        ApiRepository.getSourceCode ($scope.api.name, className)
            .then(function (data) {
                $scope.filename = className + '.php';
                $scope.classType = classType + ' Class';
                if (typeof data.source === 'string') {
                    $scope.sourceCode = $sce.trustAsHtml(data.source);
                } else {
                    $scope.sourceCode = '';
                }
            });
    };
});

})(_);
