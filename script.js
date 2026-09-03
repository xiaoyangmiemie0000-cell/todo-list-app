// 待办事项应用 - 本地存储功能

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const clearBtn = document.getElementById('clearBtn');
const filterBtns = document.querySelectorAll('.filter-btn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const activeCount = document.getElementById('activeCount');

let todos = [];
let currentFilter = 'all';
const STORAGE_KEY = 'todos';

// 初始化应用
function init() {
    loadFromStorage();
    renderTodos();
    updateStats();
    setupEventListeners();
}

// 从本地存储加载数据
function loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        todos = JSON.parse(stored);
    }
}

// 保存到本地存储
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 设置事件监听
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    clearBtn.addEventListener('click', clearCompleted);
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            renderTodos();
        });
    });
}

// 添加待办事项
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) {
        alert('请输入待办事项！');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: 'medium',
        createdAt: new Date().toLocaleString('zh-CN')
    };

    todos.unshift(todo);
    saveToStorage();
    todoInput.value = '';
    todoInput.focus();
    renderTodos();
    updateStats();
}

// 删除待办事项
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveToStorage();
    renderTodos();
    updateStats();
}

// 切换待办事项完成状态
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveToStorage();
        renderTodos();
        updateStats();
    }
}

// 清空已完成的项目
function clearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    if (completedTodos.length === 0) {
        alert('没有已完成的项目！');
        return;
    }

    if (confirm(`确定要删除 ${completedTodos.length} 个已完成的项目吗？`)) {
        todos = todos.filter(t => !t.completed);
        saveToStorage();
        renderTodos();
        updateStats();
    }
}

// 渲染待办事项列表
function renderTodos() {
    todoList.innerHTML = '';

    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'completed') return todo.completed;
        if (currentFilter === 'active') return !todo.completed;
        return true;
    });

    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
        clearBtn.disabled = todos.filter(t => t.completed).length === 0;
        return;
    }

    emptyState.classList.remove('show');
    clearBtn.disabled = todos.filter(t => t.completed).length === 0;

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-priority priority-${todo.priority}">${getPriorityText(todo.priority)}</span>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">删除</button>
        `;
        todoList.appendChild(li);
    });
}

// 获取优先级文本
function getPriorityText(priority) {
    const map = {
        'high': '高',
        'medium': '中',
        'low': '低'
    };
    return map[priority] || '中';
}

// 转义HTML字符，防止XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 更新统计数据
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    activeCount.textContent = active;
}

// 导出待办事项列表为JSON
function exportTodos() {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos_${new Date().getTime()}.json`;
    link.click();
}

// 导入待办事项列表
function importTodos(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                todos = imported;
                saveToStorage();
                renderTodos();
                updateStats();
                alert('导入成功！');
            }
        } catch (err) {
            alert('导入失败，请确保文件格式正确！');
        }
    };
    reader.readAsText(file);
}

// 页面卸载时自动保存
window.addEventListener('beforeunload', () => {
    saveToStorage();
});

// 应用初始化
init();