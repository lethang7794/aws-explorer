import { SERVICE_ICON_TO_RESOURCE_ICON_PREFIX } from '@/data/aws-service-icon-to-resource-prefix'
import { Service } from '@/lib/aws-services-data'
import { pascalToTitleCase } from '@/lib/text'

export function getResourceNameFromServiceName(
  resource: string,
  service: Service
): string {
  let resourcePrefix =
    SERVICE_ICON_TO_RESOURCE_ICON_PREFIX[service.iconService || ''] ||
    service.iconService
  let resourceWithoutPrefix = resource.replace(resourcePrefix || '', '')

  return pascalToTitleCase(
    resourceWithoutPrefix.replaceAll('-', ' ').replaceAll('_', ' ')
  )
    .replace('A W S', 'AWS')
    .replace('H D F S', 'HDFS')
    .replace('E M R', 'EMR')
    .replace('Open Search', 'OpenSearch')
    .replace('Gluefor ', 'Glue for ')
    .replace('R A3', 'RA3')
    .replace('Editorv20', 'Editor v2.0')
    .replace('M L', 'ML')
    .replace('H T T P', 'HTTP')
    .replace('A M I', 'AMI')
    .replace('N E T', '.NET')
    .replace('D B', 'DB')
    .replace('I P', 'IP')
    .replace('Instancewith', 'Instance with')
    .replace('Cloud Watch', 'CloudWatch')
    .replace(/Container([123])/, 'Container $1')
    .replace('Copi Io T  C L I', 'Copilot CLI')
    .replace('E C S ', 'ECS ')
    .replace('E K S ', 'EKS ')
    .replace('E K S ', 'EKS ')
    .replace('Dynamo DB', 'DynamoDB')
    .replace('Globalsecondaryindex', 'Global Secondary Index')
    .replace('Infrequent Access', 'Infrequent-Access')
    .replace('Postgre S Q L', 'PostgreSQL')
    .replace('A Z', 'AZ')
    .replace('Elasti Cachefor ', 'ElastiCache for ')
    .replace('Crossaccount', 'Cross-account')
    .replace('R U M', 'RUM')
    .replace('Ops Center', 'OpsCenter')
    .replace('A S2', 'AS2')
    .replace('F T P S', 'FTPS')
    .replace('S F T P', 'SFTP')
    .replace('AWSFTP', 'AWS FTP')
    .replace('F Sx', 'FSx')
    .replace('D N S', 'DNS')
    .replace('V P C ', 'VPC ')
    .replace('I A', 'IA')
    .replace('Io T  Device  Jobs', 'IoT Device Jobs')
    .replace('Directorybucket', 'Directory bucket')
    .replace('N A T', 'NAT')
    .replace('V P N', 'VPN')
    .replace('Virtualprivatecloud V P C', 'Virtual private cloud (VPC)')
    .replace('V P C', 'VPC')
    .replace('Q P U', 'QPU')
    .replace(/Simulator([1234])/, 'Simulator $1')
    .replace('R O S', 'ROS')
    .replace('A D', 'AD')
    .replace('S T S', 'STS')
    .replace('IA M ', 'IAM ')
    .replace('M F A', 'MFA')
    .replace('F T P', 'FTP')
    .replace('Volumegp3', 'Volume gp3')
    .replace('E F S ', 'EFS ')
    .replace('Backupfor A W S', 'Backup for AWS')
    .replace('Net App  O N T A P', 'NetApp ONTAP')
    .replace('AWS Backupsupportfor ', 'AWS Backup support for ')
    .replace('V Mware', 'VMware')
    .replace('R D S', 'RDS')
    .replace('Instancealternate', 'Instance alternate')
    .replace('S Q L', 'SQL')
    .replace('P I O P S', 'PIOPS')
    .replace('Extensionsfor', 'Extensions for')
    .replace('A P Is', 'APIs')
    .replace(
      'Databasemigrationworkfloworjob',
      'Database migration workflow or job'
    )
    .replace('E K Son Outposts', 'EKS on Outposts')
    .replace('Uicksight Paginated Reports', 'Paginated Reports')
    .replace('A W S', 'AWS')
    .replaceAll(' For ', ' for ')
  // .replace('', '')
}
