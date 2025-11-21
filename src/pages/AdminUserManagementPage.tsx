import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Divider,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Search,
  FilterList,
  User,
  UserPlus,
  Edit,
  Delete,
  Refresh,
  ChevronDown,
  Check,
  AlertCircle,
  Block,
  Unblock,
  Download,
  Upload,
  LockOpen,
  MoreVert,
  Menu as MenuIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
// 移除对已删除AuthContext的引用
// 移除未使用的toast导入

// 用户接口定义
interface User {
  id: string
  username: string
  email: string
  phone: string
  realName: string
  role: 'farmer' | 'dealer' | 'admin'
  isActive: boolean
  isVerified: boolean
  createdAt: string
  lastLogin?: string
  profileImage?: string
  address?: string
  companyName?: string
}

const AdminUserManagementPage: React.FC = () => {
  const navigate = useNavigate()
  
  // 模拟当前管理员用户
  const user = {
    id: 'admin1',
    username: 'admin',
    role: 'admin'
  };
  
  // 模拟用户数据
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'farmer1',
      email: 'farmer1@example.com',
      phone: '13800138001',
      realName: '张农户',
      role: 'farmer',
      isActive: true,
      isVerified: true,
      createdAt: '2023-01-01T00:00:00Z',
      lastLogin: '2023-01-10T00:00:00Z'
    },
    {
      id: '2',
      username: 'dealer1',
      email: 'dealer1@example.com',
      phone: '13900139001',
      realName: '李经销商',
      role: 'dealer',
      isActive: true,
      isVerified: true,
      createdAt: '2023-01-02T00:00:00Z',
      companyName: '丰收农产品公司'
    },
    {
      id: '3',
      username: 'farmer2',
      email: 'farmer2@example.com',
      phone: '13700137001',
      realName: '王农户',
      role: 'farmer',
      isActive: false,
      isVerified: false,
      createdAt: '2023-01-03T00:00:00Z'
    }
  ];
  
  // 模拟用户管理功能
  const getUsers = async () => {
    console.log('获取用户列表');
    return mockUsers;
  };
  
  const updateUserRole = async (userId: string, newRole: 'farmer' | 'dealer' | 'admin') => {
    console.log(`更新用户${userId}角色为${newRole}`);
    return { success: true };
  };
  
  const toggleUserStatus = async (userData: User) => {
    console.log(`切换用户${userData.id}状态`);
    return { success: true };
  };
  
  const deleteUser = async () => {
    console.log(`删除用户${selectedUser?.id}`);
    return { success: true };
  };
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // 检查用户是否为管理员
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }
    
    // 加载用户数据
    loadUsers()
  }, [user, navigate])

  // 加载用户列表
  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // 使用模拟数据，避免API调用
      const usersData = mockUsers;
      setUsers(usersData)
      setFilteredUsers(usersData)
    } catch (error) {
      console.error('Failed to load users:', error)
      // 移除toast依赖，直接显示控制台错误
      console.error('获取用户列表失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 搜索和筛选用户
  useEffect(() => {
    let result = [...users]
    
    // 搜索筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        user =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.realName.toLowerCase().includes(query) ||
          user.phone.includes(query)
      )
    }
    
    // 角色筛选
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter)
    }
    
    // 状态筛选
    if (statusFilter !== 'all') {
      result = result.filter(user => user.isActive === (statusFilter === 'active'))
    }
    
    // 认证筛选
    if (verificationFilter !== 'all') {
      result = result.filter(user => user.isVerified === (verificationFilter === 'verified'))
    }
    
    // 排序
    result.sort((a, b) => {
      if (sortField === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      } else if (sortField === 'username' || sortField === 'email' || sortField === 'realName') {
        return sortDirection === 'asc' 
          ? a[sortField as keyof User].toString().localeCompare(b[sortField as keyof User].toString())
          : b[sortField as keyof User].toString().localeCompare(a[sortField as keyof User].toString())
      }
      return 0
    })
    
    setFilteredUsers(result)
    setCurrentPage(1) // 重置到第一页
  }, [users, searchQuery, roleFilter, statusFilter, verificationFilter, sortField, sortDirection])

  // 处理排序
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // 分页
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  // 处理用户状态切换
  const handleToggleUserStatus = async (user: User) => {
    try {
      await toggleUserStatus(user.id, !user.isActive)
      toast.success(user.isActive ? '用户已禁用' : '用户已启用')
      loadUsers() // 重新加载用户列表
    } catch (error: any) {
      toast.error(error.message || '操作失败')
    }
  }

  // 处理用户角色更新
  const handleUpdateRole = async (userId: string, newRole: 'farmer' | 'dealer' | 'admin') => {
    try {
      await updateUserRole(userId, newRole)
      toast.success('用户角色更新成功')
      loadUsers() // 重新加载用户列表
      setEditDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || '更新角色失败')
    }
  }

  // 处理用户删除
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    try {
      await deleteUser(selectedUser.id)
      toast.success('用户已删除')
      loadUsers() // 重新加载用户列表
      setDeleteDialogOpen(false)
      setSelectedUser(null)
    } catch (error: any) {
      toast.error(error.message || '删除失败')
    }
  }

  // 渲染用户角色标签
  const renderRoleChip = (role: string) => {
    const roleConfig = {
      farmer: { label: '农户', color: 'primary' },
      dealer: { label: '经销商', color: 'success' },
      admin: { label: '管理员', color: 'warning' }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'default' }
    
    return (
      <Chip
        label={config.label}
        size="small"
        color={config.color}
        variant="outlined"
      />
    )
  }

  // 渲染用户状态标签
  const renderStatusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? '活跃' : '禁用'}
      size="small"
      color={isActive ? 'success' : 'error'}
      variant="outlined"
    />
  )

  // 渲染认证状态标签
  const renderVerificationChip = (isVerified: boolean) => (
    <Chip
      label={isVerified ? '已认证' : '未认证'}
      size="small"
      color={isVerified ? 'info' : 'default'}
      variant="outlined"
    />
  )

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  }

  return (
    
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full"
        >
          {/* 页面标题 */}
          <motion.div variants={itemVariants} className="mb-6 flex justify-between items-center">
              <div>
                <Typography variant="h4" component="h1" fontWeight="bold" className="text-primary mb-1">
                  用户管理
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  管理平台所有用户账户、权限和状态
                </Typography>
              </div>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={loadUsers}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                '刷新'
              )}
            </Button>
          </motion.div>

          {/* 搜索和筛选 */}
          <motion.div variants={itemVariants} className="mb-6 bg-white p-4 rounded-lg shadow-sm">
            <Grid container spacing={3}
              sx={{
                '& .MuiTextField-root': {
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderRadius: 1,
                    },
                  },
                },
              }}
            >
              <Grid item xs={12} md={4}>
                <TextField
                  label="搜索用户"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth>
                  <InputLabel>用户角色</InputLabel>
                  <Select
                    label="用户角色"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <MenuItem value="all">全部角色</MenuItem>
                    <MenuItem value="farmer">农户</MenuItem>
                    <MenuItem value="dealer">经销商</MenuItem>
                    <MenuItem value="admin">管理员</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth>
                  <InputLabel>账户状态</InputLabel>
                  <Select
                    label="账户状态"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">全部状态</MenuItem>
                    <MenuItem value="active">活跃</MenuItem>
                    <MenuItem value="inactive">禁用</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth>
                  <InputLabel>认证状态</InputLabel>
                  <Select
                    label="认证状态"
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                  >
                    <MenuItem value="all">全部状态</MenuItem>
                    <MenuItem value="verified">已认证</MenuItem>
                    <MenuItem value="unverified">未认证</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => {
                    setSearchQuery('')
                    setRoleFilter('all')
                    setStatusFilter('all')
                    setVerificationFilter('all')
                  }}
                  startIcon={<FilterList />}
                  sx={{ mt: { xs: 2, sm: 2, md: 3.5 } }}
                >
                  重置筛选
                </Button>
              </Grid>
            </Grid>
          </motion.div>

          {/* 用户统计卡片 */}
          <motion.div variants={itemVariants} className="mb-6">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" className="p-4 text-center"
                  sx={{
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(21, 101, 192, 0.04)',
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {users.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    总用户数
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" className="p-4 text-center"
                  sx={{
                    borderColor: 'success.main',
                    backgroundColor: 'rgba(46, 125, 50, 0.04)',
                  }}
                >
                  <Typography variant="h4" color="success" fontWeight="bold">
                    {users.filter(u => u.isActive).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    活跃用户
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" className="p-4 text-center"
                  sx={{
                    borderColor: 'info.main',
                    backgroundColor: 'rgba(0, 188, 212, 0.04)',
                  }}
                >
                  <Typography variant="h4" color="info" fontWeight="bold">
                    {users.filter(u => u.isVerified).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    已认证用户
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined" className="p-4 text-center"
                  sx={{
                    borderColor: 'warning.main',
                    backgroundColor: 'rgba(255, 193, 7, 0.04)',
                  }}
                >
                  <Typography variant="h4" color="warning" fontWeight="bold">
                    {users.filter(u => u.role === 'dealer').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    经销商数量
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </motion.div>

          {/* 用户列表表格 */}
          <motion.div variants={itemVariants}>
            <Paper elevation={2} className="overflow-hidden rounded-lg">
              {isLoading ? (
                <Box className="p-8 flex justify-center">
                  <CircularProgress size={40} />
                </Box>
              ) : filteredUsers.length === 0 ? (
                <Box className="p-8 text-center">
                  <Alert severity="info"
                    icon={<Info />}
                    className="max-w-md mx-auto"
                  >
                    没有找到符合条件的用户
                  </Alert>
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                      <TableHead className="bg-gray-50">
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>用户信息</TableCell>
                          <TableCell
                            sx={{ fontWeight: 'bold' }}
                            onClick={() => handleSort('username')}
                            className="cursor-pointer"
                          >
                            用户名
                            {sortField === 'username' && (
                              sortDirection === 'asc' ? ' ↑' : ' ↓'
                            )}
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: 'bold' }}
                            onClick={() => handleSort('email')}
                            className="cursor-pointer"
                          >
                            邮箱
                            {sortField === 'email' && (
                              sortDirection === 'asc' ? ' ↑' : ' ↓'
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>角色</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>状态</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>认证状态</TableCell>
                          <TableCell
                            sx={{ fontWeight: 'bold' }}
                            onClick={() => handleSort('createdAt')}
                            className="cursor-pointer"
                          >
                            创建时间
                            {sortField === 'createdAt' && (
                              sortDirection === 'asc' ? ' ↑' : ' ↓'
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>操作</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentUsers.map((user) => (
                          <TableRow key={user.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar
                                  src={user.profileImage || undefined}
                                  alt={user.username}
                                  sx={{ width: 36, height: 36 }}
                                >
                                  {!user.profileImage && user.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <div>
                                  <Typography variant="body2" fontWeight="medium">
                                    {user.realName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {user.phone}
                                  </Typography>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{renderRoleChip(user.role)}</TableCell>
                            <TableCell>{renderStatusChip(user.isActive)}</TableCell>
                            <TableCell>{renderVerificationChip(user.isVerified)}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {user.role !== 'admin' && (
                                  <>
                                    <Tooltip title="编辑用户">
                                      <IconButton
                                        size="small"
                                        onClick={() => {
                                          setSelectedUser(user)
                                          setEditDialogOpen(true)
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title={user.isActive ? '禁用用户' : '启用用户'}>
                                      <IconButton
                                        size="small"
                                        onClick={() => handleToggleUserStatus(user)}
                                      >
                                        {user.isActive ? <Block fontSize="small" /> : <Unblock fontSize="small" />}
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="删除用户">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                          setSelectedUser(user)
                                          setDeleteDialogOpen(true)
                                        }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                                <Tooltip title="查看详情">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/user/${user.id}`)}
                                  >
                                    <User fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* 分页控件 */}
                  <Box className="p-4 border-t border-gray-200 flex justify-between items-center">
                    <Typography variant="body2" color="text.secondary">
                      显示 {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} 条，共 {filteredUsers.length} 条
                    </Typography>
                    <Box className="flex items-center gap-2">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        上一页
                      </Button>
                      <Typography variant="body2">
                        {currentPage} / {totalPages}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        下一页
                      </Button>
                    </Box>
                </Box>
              </>
              )}
            </Paper>
          </motion.div>
        </motion.div>

        {/* 删除确认对话框 */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle color="error">确认删除用户？</DialogTitle>
          <DialogContent>
            <Typography variant="body1" className="mb-4">
              此操作无法撤销，删除后用户将无法登录系统，相关数据可能会受到影响。
            </Typography>
            {selectedUser && (
              <Box className="p-3 bg-gray-50 rounded">
                <Typography variant="body2" className="font-medium">
                  用户名: {selectedUser.username}
                </Typography>
                <Typography variant="body2" className="font-medium">
                  真实姓名: {selectedUser.realName}
                </Typography>
                <Typography variant="body2" className="font-medium">
                  用户角色: {selectedUser.role === 'farmer' ? '农户' : selectedUser.role === 'dealer' ? '经销商' : '管理员'}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteUser}
            >
              确认删除
            </Button>
          </DialogActions>
        </Dialog>

        {/* 编辑用户对话框 */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}
          maxWidth="sm" fullWidth>
          <DialogTitle>编辑用户信息</DialogTitle>
          <DialogContent>
            {selectedUser && (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={selectedUser.profileImage || undefined}
                    alt={selectedUser.username}
                    sx={{ width: 60, height: 60 }}
                  >
                    {!selectedUser.profileImage && selectedUser.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <Typography variant="h6" className="font-medium">
                      {selectedUser.username}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {selectedUser.id}
                    </Typography>
                  </div>
                </div>

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>用户角色</InputLabel>
                      <Select
                        label="用户角色"
                        value={selectedUser.role}
                        onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value as 'farmer' | 'dealer' | 'admin')}
                      >
                        <MenuItem value="farmer">农户</MenuItem>
                        <MenuItem value="dealer">经销商</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control=
                        {
                          <Switch
                            checked={selectedUser.isActive}
                            onChange={() => handleToggleUserStatus(selectedUser)}
                          />
                        }
                        label={selectedUser.isActive ? '账户已启用' : '账户已禁用'}
                      />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control=
                        {
                          <Switch
                            checked={selectedUser.isVerified}
                            onChange={async () => {
                              // 这里可以添加验证状态切换的逻辑
                              toast.info('认证状态切换功能待实现')
                            }}
                          />
                        }
                        label={selectedUser.isVerified ? '已通过认证' : '未认证'}
                      />
                  </Grid>
                </Grid>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              关闭
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    
  )
}

export default AdminUserManagementPage