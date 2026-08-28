import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  const roles = ['Super Admin', 'Admin', 'Project Manager', 'Team Lead', 'Developer'];
  const roleMap: Record<string, any> = {};

  for (const roleName of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    roleMap[roleName] = role;
  }
  const adminEmail = 'admin@snec.in';
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        passwordHash,
        roleId: roleMap['Super Admin'].id,
      },
    });
    console.log('Super Admin user created: admin@snec.in / admin123');
  } else {
    console.log('Super Admin user already exists');
  }

  const dummyUsers = [
    { email: 'admin2@snec.in', name: 'Standard Admin', role: 'Admin' },
    { email: 'pm@snec.in', name: 'Project Manager', role: 'Project Manager' },
    { email: 'lead@snec.in', name: 'Team Lead', role: 'Team Lead' },
    { email: 'dev@snec.in', name: 'Developer', role: 'Developer' },
  ];

  for (const dummy of dummyUsers) {
    const exists = await prisma.user.findUnique({ where: { email: dummy.email } });
    if (!exists) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);

      await prisma.user.create({
        data: {
          name: dummy.name,
          email: dummy.email,
          passwordHash,
          roleId: roleMap[dummy.role].id,
        }
      });
      console.log(`Created dummy user: ${dummy.email} / password123 / Role: ${dummy.role}`);
    }
  }

  const permissionsData = [
    { action: 'manage', resource: 'users' },
    { action: 'manage', resource: 'projects' },
    { action: 'manage', resource: 'tasks' },
    { action: 'read', resource: 'projects' },
    { action: 'read', resource: 'tasks' },
    { action: 'create', resource: 'tasks' },
    { action: 'update', resource: 'tasks' },
    { action: 'delete', resource: 'tasks' },
    { action: 'manage', resource: 'roles' },
  ];

  const permissionMap: Record<string, any> = {};
  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { action_resource: { action: perm.action, resource: perm.resource } },
      update: {},
      create: perm,
    });
    permissionMap[`${perm.action}_${perm.resource}`] = p;
  }

  for (const perm of Object.values(permissionMap)) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleMap['Super Admin'].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roleMap['Super Admin'].id, permissionId: perm.id },
    });
  }

  const devPerms = [
    permissionMap['read_projects'],
    permissionMap['read_tasks'],
    permissionMap['update_tasks']
  ];
  for (const perm of devPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleMap['Developer'].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roleMap['Developer'].id, permissionId: perm.id },
    });
  }

  for (const perm of Object.values(permissionMap)) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleMap['Admin'].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roleMap['Admin'].id, permissionId: perm.id },
    });
  }

  const pmPerms = [
    permissionMap['manage_projects'],
    permissionMap['manage_tasks'],
  ];
  for (const perm of pmPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleMap['Project Manager'].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roleMap['Project Manager'].id, permissionId: perm.id },
    });
  }

  const leadPerms = [
    permissionMap['read_projects'],
    permissionMap['manage_tasks'],
  ];
  for (const perm of leadPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: roleMap['Team Lead'].id, permissionId: perm.id } },
      update: {},
      create: { roleId: roleMap['Team Lead'].id, permissionId: perm.id },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
