// Wait for the DOM to load before executing
document.addEventListener("DOMContentLoaded", () => {
    const timelineContainer = document.querySelector('.timeline');
    const modals = document.querySelectorAll(".modal");
  
    // --- Modal Interactivity via Event Delegation ---
    timelineContainer.addEventListener("click", (e) => {
      const eventEl = e.target.closest('.timeline-event');
      if (eventEl) {
        const modalId = eventEl.getAttribute("data-modal");
        openModal(modalId);
      }
    });
  
    // Attach close functionality to each modal’s close button and outside clicks.
    modals.forEach(modal => {
      const closeButton = modal.querySelector(".close-button");
      if (closeButton) {
        closeButton.addEventListener("click", () => closeModal(modal));
      }
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });
  
    function openModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.style.display = "block";
    }
    function closeModal(modal) {
      modal.style.display = "none";
    }
  
    // --- Duplicate Timeline Events for Seamless Looping ---
    timelineContainer.innerHTML += timelineContainer.innerHTML;
  
    // --- Add connector lines between adjacent events sharing the same period ---
    const timelineEvents = document.querySelectorAll('.timeline-event');
    timelineEvents.forEach((event, index) => {
      if (index > 0) {
        const prev = timelineEvents[index - 1];
        if (event.getAttribute('data-period') === prev.getAttribute('data-period')) {
          event.classList.add('connected');
        }
      }
    });
  
    // --- Interactive Pong Game ---
    const canvas = document.getElementById('pongGame');
    const ctx = canvas.getContext('2d');
  
    // Resize canvas to full window size
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  
    // Pong game settings
    const paddleWidth = 10, paddleHeight = 100, ballSize = 10;
    let leftPaddle = { x: 20, y: canvas.height / 2 - paddleHeight / 2, dy: 0 },
        rightPaddle = { x: canvas.width - 30, y: canvas.height / 2 - paddleHeight / 2, dy: 0 },
        ball = { x: canvas.width / 2, y: canvas.height / 2, dx: 3, dy: 3 };
  
    // Track mouse movement for left paddle
    canvas.addEventListener('mousemove', (e) => {
      leftPaddle.y = e.clientY - paddleHeight / 2;
    });
  
    // Simple AI for right paddle
    function moveRightPaddle() {
      const center = rightPaddle.y + paddleHeight / 2;
      if (center < ball.y - 10) {
        rightPaddle.dy = 3;
      } else if (center > ball.y + 10) {
        rightPaddle.dy = -3;
      } else {
        rightPaddle.dy = 0;
      }
      rightPaddle.y += rightPaddle.dy;
    }
  
    // Update ball position and check collisions
    function updateBall() {
      ball.x += ball.dx;
      ball.y += ball.dy;
  
      // Bounce off top and bottom
      if (ball.y < 0 || ball.y > canvas.height - ballSize) {
        ball.dy *= -1;
      }
  
      // Bounce off left paddle
      if (ball.x < leftPaddle.x + paddleWidth &&
          ball.y > leftPaddle.y &&
          ball.y < leftPaddle.y + paddleHeight) {
        ball.dx *= -1;
        ball.x = leftPaddle.x + paddleWidth;
      }
  
      // Bounce off right paddle
      if (ball.x > rightPaddle.x - ballSize &&
          ball.y > rightPaddle.y &&
          ball.y < rightPaddle.y + paddleHeight) {
        ball.dx *= -1;
        ball.x = rightPaddle.x - ballSize;
      }
  
      // Reset ball if it goes off-screen
      if (ball.x < 0 || ball.x > canvas.width) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = 3 * (Math.random() > 0.5 ? 1 : -1);
        ball.dy = 3 * (Math.random() > 0.5 ? 1 : -1);
      }
    }
  
    // Draw game elements
    function drawPong() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // Draw left paddle
      ctx.fillStyle = "#ff4081";
      ctx.fillRect(leftPaddle.x, leftPaddle.y, paddleWidth, paddleHeight);
  
      // Draw right paddle
      ctx.fillStyle = "#ff4081";
      ctx.fillRect(rightPaddle.x, rightPaddle.y, paddleWidth, paddleHeight);
  
      // Draw ball
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(ball.x, ball.y, ballSize, ballSize);
    }
  
    // Pong game loop
    function gameLoop() {
      moveRightPaddle();
      updateBall();
      drawPong();
      requestAnimationFrame(gameLoop);
    }
    gameLoop();
  
    // --- Auto-scroll Timeline (with Seamless Looping) ---
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    function autoScrollTimeline() {
      // Scroll 1 pixel per frame (adjust speed as desired)
      timelineWrapper.scrollLeft += 1;
      // When the scroll reaches half of the container’s scrollWidth (the original set), reset to 0.
      if (timelineWrapper.scrollLeft >= timelineContainer.scrollWidth / 2) {
        timelineWrapper.scrollLeft = 0;
      }
      requestAnimationFrame(autoScrollTimeline);
    }
    autoScrollTimeline();
  });
  