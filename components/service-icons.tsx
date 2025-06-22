import type { Service } from '@/lib/aws-services-data'
import { cn } from '@/lib/utils'

export function ServiceIcons({
  service,
  size = 'small',
  className,
  classNameWrapper,
}: {
  service: Service
  size?: 'small' | 'medium' | 'large'
  className?: string
  classNameWrapper?: string
}) {
  const classNames = 'flex-shrink-0'
  const sizeMap = {
    small: 'h-8 w-8',
    medium:
      'h-[48px] w-[48px] lg:h-[60px] lg:w-[60px] min-[3839px]:h-24 min-[3839px]:w-24 min-[4000px]:h-28 min-[4000px]:w-28',
    large:
      'h-16 w-16 lg:h-24 lg:w-24 min-[3839px]:h-32 min-[3839px]:w-32 min-[4000px]:h-40 min-[4000px]:w-40',
  }
  const sizeClasses = sizeMap[size] || sizeMap.small

  return (
    <>
      {service.iconService ? (
        <img
          id={service.iconService}
          src={`/aws/${service.iconService}.svg`}
          alt={service.iconService}
          className={cn(classNames, sizeClasses, className)}
        />
      ) : service.iconServices ? null : (
        <img
          src={`/aws/GeneralResource.svg`}
          alt={service.iconService}
          className={cn(classNames, sizeClasses, className)}
        />
      )}
      {service.iconServices ? (
        <div
          className={cn(
            'flex-shrink-0 max-w-26 h-fit flex flex-wrap justify-center items-start gap-2',
            classNameWrapper
          )}
        >
          {service.iconServices.map((icon) => (
            <img
              key={icon}
              src={`/aws/${icon}.svg`}
              alt={icon}
              className={cn(classNames, sizeClasses, className)}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}
