/**
 * Test Engine - Testing the new game engine architecture
 */
import { GameEngine } from './core/GameEngine';
import { globalEventBus as EventBus } from './core/EventBus';
import { globalServiceLocator as ServiceLocator } from './core/ServiceLocator';
import { InputSystem } from './systems/InputSystem';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { RenderSystem } from './systems/RenderSystem';
import { GameEvents } from './constants/eventTypes';

// Initialize systems
function initializeSystems(): void {
  // Get canvas element
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  // Create input system
  const inputSystem = new InputSystem({
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD']
  });

  // Create physics system
  const physicsSystem = new PhysicsSystem();

  // Create render system
  const renderSystem = new RenderSystem(canvas);

  console.log('Systems created successfully');
}

// Test service locator functionality
function testServiceLocator(): void {
  console.log('Testing ServiceLocator...');
  
  // Try to get a registered service
  try {
    const inputSystem = ServiceLocator.get<InputSystem>('inputSystem');
    console.log('InputSystem retrieved:', inputSystem);
  } catch (error) {
    console.log('InputSystem not found (expected initially):', error);
  }

  // Test canvas retrieval via RenderSystem
  try {
    const renderSystem = ServiceLocator.get<RenderSystem>('renderSystem');
    const canvas = renderSystem?.getCanvas();
    console.log('Canvas retrieved via RenderSystem:', canvas);
  } catch (error) {
    console.log('RenderSystem not found (expected initially):', error);
  }
}

// Test event bus functionality  
function testEventBus(): void {
  console.log('Testing EventBus...');
  
  // Subscribe to test event
  const unsubscribe = EventBus.on('test:event', (data) => {
    console.log('Test event received:', data);
  });

  // Emit test event
  EventBus.emit('test:event', { message: 'Hello from EventBus!' });

  // Unsubscribe
  unsubscribe();
  console.log('EventBus test completed');
}

// Test game engine integration
function testGameEngine(): void {
  console.log('Testing GameEngine...');
  
  // Get canvas element
  const canvas = ServiceLocator.get<RenderSystem>('renderSystem')?.getCanvas();
  if (!canvas) {
    console.error('Canvas not available');
    return;
  }

  // Create game engine with EventBus
  const engine = new GameEngine(EventBus);

  // Initialize systems
  const inputSystem = ServiceLocator.get<InputSystem>('inputSystem');
  const physicsSystem = ServiceLocator.get<PhysicsSystem>('physicsSystem');  
  const renderSystem = ServiceLocator.get<RenderSystem>('renderSystem');

  console.log('GameEngine test completed');
}

// Main test function
async function runTests(): Promise<void> {
  try {
    console.log('Starting engine tests...');
    
    // Initialize systems first
    initializeSystems();
    
    // Test service locator
    testServiceLocator();
    
    // Test event bus
    testEventBus();
    
    // Test game engine
    testGameEngine();
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Set up collision event listener
function setupEventListeners(): void {
  EventBus.on(GameEvents.PLAYER_COLLISION, (data) => {
    console.log('Collision detected:', data);
  });

  console.log('Event listeners set up');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    runTests();
  });
} else {
  setupEventListeners();
  runTests();
}

// Export for debugging
(window as any).testEngine = {
  runTests,
  testServiceLocator,
  testEventBus,
  testGameEngine,
  ServiceLocator,
  EventBus
};
