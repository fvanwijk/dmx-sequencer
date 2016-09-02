
angular.module('dmx', [])
  .service('SocketService', function () {
    var socket = io('http://localhost:4000');

    this.send = function (data) {
      socket.emit('tick', data);
    }

  })
  .service('TimeService', function () {
    this.time = { current: -1 };
  })
  .service('EditService', function () {
    this.isEditing = false;
  })
  .component('timebar', {
    template: `
<div class="ui grid">
  <div class="two wide column"></div>
  <div class="fourteen wide column marker-column">
    <div ng-show="$ctrl.time.current > -1" class="marker" ng-class="{ isPlaying: 'active' }" style="left: {{$ctrl.time.current/14*100}}%; width: {{100/14}}%"></div>
  </div>
</div>
`,
    controller: function (TimeService) {
      this.time = TimeService.time;
    }
  })
  .component('sequencer', {
    template: `
<div class="sequencer">
  <table class="ui fixed compact table">
    <thead>
      <tr class="center aligned">
        <th class="two wide">Measure</th>
        <th class="one wide">1</th>
        <th class="one wide">2</th>
        <th class="one wide">3</th>
        <th class="one wide">4</th>
        <th class="one wide">5</th>
        <th class="one wide">6</th>
        <th class="one wide">7</th>
        <th class="one wide">8</th>
        <th class="one wide">9</th>
        <th class="one wide">10</th>
        <th class="one wide">11</th>
        <th class="one wide">12</th>
        <th class="one wide">13</th>
        <th class="one wide">14</th>
      </tr>
    </thead>
    <tbody>
      <tr class="center aligned">
        <th class="right aligned">Color</th>
        <td class="one wide" ng-repeat="measure in $ctrl.data track by $index">
          <color value="measure.color" measure="$index"></color>
        </td>
      </tr>
  
      <tr class="center aligned">
        <th class="right aligned">Gobo</th>
        <td class="one wide" ng-repeat="measure in $ctrl.data track by $index">
          <gobo value="measure.gobo"></gobo>
        </td>
      </tr>
      
      <tr class="center aligned">
        <th class="right aligned">Pan</th>
        <td class="one wide" ng-repeat="measure in $ctrl.data track by $index">
          <input type="range" min="0" max="100" ng-model="measure.pan">
        </td>
      </tr>
      
      <tr class="center aligned">
        <th class="right aligned">Tilt</th>
        <td class="one wide" ng-repeat="measure in $ctrl.data track by $index">
          <input type="range" min="0" max="100" ng-model="measure.tilt">
        </td>
      </tr>
      
      <tr class="center aligned">
        <th class="right aligned">Strobe</th>
        <td class="one wide" ng-repeat="measure in $ctrl.data track by $index">
          <input type="range" min="0" max="100" ng-model="measure.strobe">
        </td>
      </tr>
    </tbody>
  </table>
  <timebar></timebar>
</div>
<buttons data="$ctrl.data"></buttons>
`,
    controller: function ($http, EditService) {
      var $ctrl = this;

      $ctrl.isEditing = EditService.isEditing;

      $http.get('data.json').then(function (result) {
        $ctrl.data = result.data;
      });
    }
  })
  .component('buttons', {
    template: `
      <div class="ui buttons">
        <button class="ui icon button" ng-click="$ctrl.stop()">
          <i class="icon stop"></i>
        </button>
        <button class="ui icon primary button" ng-click="$ctrl.play()" ng-if="!$ctrl.isPlaying">
          <i class="icon play"></i>
          Start
        </button>
        <button class="ui icon primary button" ng-click="$ctrl.pause()" ng-if="$ctrl.isPlaying">
          <i class="icon pause"></i>
          Pause
        </button>
      </div>
`,
    bindings: { data: '=' },
    controller: function ($scope, TimeService, SocketService, $interval) {
      var $ctrl = this;

      $ctrl.time = TimeService.time;

      var interval;

      $ctrl.sendCommand = function (measure) {
        //console.log('sendcommand', measure, $ctrl.data[measure]);
        SocketService.send($ctrl.data[measure])
      };

      $ctrl.play = function () {
        $ctrl.isPlaying = true;
        interval = $interval(function () {
          $ctrl.time.current = ($ctrl.time.current+1)%14;
          $ctrl.sendCommand($ctrl.time.current);
        }, 1000);
      };

      $ctrl.pause = function () {
        $ctrl.isPlaying = false;
        if (angular.isDefined(interval)) {
          $interval.cancel(interval);
          interval = undefined;
        }
      };

      $ctrl.stop = function () {
        $ctrl.pause();
        $ctrl.time.current = -1;
      };

      $scope.$on('$destroy', function() {
        $ctrl.stop();
      });
    }
  })
  .component('pan', {
    bindings: {
      pan: '=value',
      measure: '='
    },
    controller: function () {

    }
  })
  .component('gobo', {
    bindings: {
      goboId: '=value',
      measure: '='
    },
    template: `
    <img ng-src="images/{{$ctrl.goboId}}.png">
`,
    controller: function () {
      var $ctrl = this;
    }
  })
  .component('color', {
    bindings: {
      color: '=value',
      measure: '='
    },
    template: `
<div ng-style="{ color: $ctrl.color }">
  <input type="color" ng-model="$ctrl.color">
</div>
`,
    controller: function (EditService) {
      var $ctrl = this;
      $ctrl.setColor = function () {
        EditService.isEditing = true;
      }
    }
  });