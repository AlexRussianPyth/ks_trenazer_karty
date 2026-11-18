/* Интеграция с Битрикс24 для локального (serverless) приложения.
 *
 * Битрикс24 открывает локальное приложение в iframe и передаёт параметры
 * (PROTOCOL, DOMAIN, AUTH_ID и т.д.) через window.name. По DOMAIN подключаем
 * JS API портала и подгоняем высоту фрейма под содержимое.
 *
 * Вне Битрикс24 (открытие напрямую) скрипт ничего не делает.
 */
(function () {
  'use strict';

  var params = null;
  try { params = JSON.parse(window.name); } catch (e) { return; }
  if (!params || typeof params !== 'object' || !params.DOMAIN) return;

  var script = document.createElement('script');
  script.src = (params.PROTOCOL || 'https') + '://' + params.DOMAIN + '/api/v1/';
  script.onload = function () {
    if (!window.BX24) return;
    BX24.init(function () {
      // Подгоняем высоту iframe под содержимое после смены экранов
      var fit = function () { try { BX24.fitWindow(); } catch (e) {} };
      fit();
      setInterval(fit, 1500);
      document.addEventListener('click', function () { setTimeout(fit, 350); });
    });
  };
  document.head.appendChild(script);
})();
