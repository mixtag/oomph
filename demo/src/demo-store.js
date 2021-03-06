import C from 'js-csp';
import E from 'ease-component';
import I from 'immutable';

import S from './store';


const ANIMATION_DURATION = 500;

S.update(()=> I.fromJS({
  currentPage: null,
  prevPage: {},
  nextPage: {},
  pageMap: {},
  topNavOffset: 1,
  bottomNavOffset: 1,
  showHome: true
  //pageX: 0,
  //newPageX: -1
}));


var channels = {
  select: {
    page: C.chan(),
    prevPage: C.chan(),
    nextPage: C.chan(),
    home: C.chan()
  }
};


var processes = {

  ease(duration, type = 'outCube'){
    var animSteps = C.chan();
    var easeSteps = C.chan();
    var start = Date.now();
    var elapsed = 0;
    var animStep;

    C.go(function*(){
      while (elapsed < duration){
        requestAnimationFrame(() => {
          C.putAsync(animSteps);
        });
        animStep =  yield animSteps;
        var x = E[type](elapsed / duration);
        C.putAsync(easeSteps, x);
        elapsed = Date.now() - start;
      }

      animSteps.close();
      easeSteps.close();
    });

    return easeSteps;
  },

  easeSeries(duration, transactor, type = 'outCube'){
    var animator = processes.ease(duration, type);
    var step;
    var doneChan = C.chan();

    C.go(function*(){
      while (step !== C.CLOSED){
        var step = yield animator;
        transactor(step);
      }

      C.putAsync(doneChan);
      animator.close();
      doneChan.close();
    });

    return doneChan;
  }

};


var commands = {

  registerPageList({ homePage, pageList }){
    var pageMap = I.Map();

    pageList.forEach((p, i) => {
      var prevPage = (i === 0)? pageList[pageList.length - 1]: pageList[i - 1];
      var nextPage = (i === pageList.length - 1)? pageList[0]: pageList[i + 1];

      pageMap = pageMap.set(p, I.Map())
        .setIn([p, 'prevPage'], prevPage)
        .setIn([p, 'nextPage'], nextPage)
        .set('homePage', homePage);
    });

    S.update(s => s.set('pageMap', pageMap));

    //console.log(pageMap.toJS());
  },

  selectPage(page){
    S.update(s =>
      s.set('currentPage', page)
       .set('prevPage', s.getIn(['pageMap', page, 'prevPage']))
       .set('nextPage', s.getIn(['pageMap', page, 'nextPage']))
       .set('showHome', false)
    );
  },

  switchPage(nextPage = true){
    if (S.query(s => s.get('commandsDisabled'))){
      return;
    }

    var incomingPage = S.query(s => s.get(nextPage? 'nextPage': 'prevPage'));

    S.update(s =>
       s.set('commandsDisabled', true)
        .set('incomingPage', incomingPage)
        .set('prevPage', s.getIn(['pageMap', incomingPage, 'prevPage']))
        .set('nextPage', s.getIn(['pageMap', incomingPage, 'nextPage']))
    );

    var doneEvent = processes.easeSeries(ANIMATION_DURATION, x =>
      S.update(s =>
        s.set('pageX', nextPage? -x: x)
         .set('newPageX', nextPage? (1-x): (-1+x))
      )
    );

    C.go(function*(){
      yield doneEvent;
      //console.log('done');

      S.update(s =>
        s.set('currentPage', incomingPage)
         .delete('incomingPage').delete('pageX').delete('newPageX')
         .set('commandsDisabled', false)
      );
    });
  },

  returnHome(){
    if (S.query(s => s.get('commandsDisabled'))){
      return;
    }

    S.update(s =>
      s.set('commandsDisabled', true)
       .set('homeY', -1)
       .set('showHome', true)
    );

    var doneEvent = processes.easeSeries(ANIMATION_DURATION,
      y => S.update(
        s => s.set('homeY', y - 1)
              .set('pageY', y)
      )

    );

    C.go(function*(){
      yield doneEvent;
      S.update(s =>
        s.delete('currentPage')
         .set('homeY', 0)
         .set('pageY', 0)
         .set('commandsDisabled', false)
      );
    });
  }

};


S.Actions = commands;

export default S;
