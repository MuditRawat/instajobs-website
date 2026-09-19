import React, { useEffect } from 'react';

const CandidateSkillsPercentage = ({
  percentage = 30,
  targetPercentage = '85%',
  fgColor = '#7367F0',
  speed = 2000,
}) => {
  useEffect(() => {
    if (window.$ && window.$.fn && window.$.fn.knob) {
      const $elm = window.$('.dial');
      if ($elm.length) {
        $elm.each(function () {
          const elm = window.$(this);
          const perc = elm.attr('value') || percentage;
          elm.knob({
            value: 0,
            min: 0,
            max: 100,
            skin: 'tron',
            readOnly: true,
            thickness: 0.45,
            dynamicDraw: true,
            displayInput: false,
          });

          window.$({ value: 0 }).animate(
            { value: perc },
            {
              duration: speed,
              easing: 'swing',
              progress: function () {
                elm.val(Math.ceil(this.value)).trigger('change');
              },
            }
          );
        });

        const $t = window.$('.pie-graph .count-box');
        $t.each(function () {
          const tBox = window.$(this);
          const n = tBox.find('.count-text').attr('data-stop') || percentage;
          const r = parseInt(tBox.find('.count-text').attr('data-speed'), 10) || speed;

          tBox.removeClass('counted');
          if (!tBox.hasClass('counted')) {
            tBox.addClass('counted');
            window.$({ countNum: 0 }).animate(
              { countNum: n },
              {
                duration: r,
                easing: 'linear',
                step: function () {
                  tBox.find('.count-text').text(Math.floor(this.countNum));
                },
                complete: function () {
                  tBox.find('.count-text').text(this.countNum);
                },
              }
            );
          }
        });
      }
    }
  }, [percentage, speed]);

  return (
    <div className="skills-percentage">
      <h4>Skills Percentage</h4>
      <p>Put value for "Cover Image" field to increase your skill up to "{targetPercentage}"</p>

      {/* Pie Graph */}
      <div className="pie-graph">
        <div className="graph-outer">
          <input
            type="text"
            className="dial"
            data-fgcolor={fgColor}
            data-bgcolor="transparent"
            data-width="234"
            data-height="234"
            data-linecap="normal"
            defaultValue={percentage}
            value={percentage}
            readOnly
          />
          <div className="inner-text count-box">
            <span className="count-text txt" data-stop={percentage} data-speed={speed}></span>%
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateSkillsPercentage;
