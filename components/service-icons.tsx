import type { Service } from '@/lib/aws-services-data'
import { cn } from '@/lib/utils'

export function ServiceIcons({
  service,
  size = 'small',
  className,
  classNameWrapper,
}: {
  service: Service
  size?: 'small' | 'large'
  className?: string
  classNameWrapper?: string
}) {
  const classNames = 'flex-shrink-0'
  const sizeClasses =
    size === 'large' ? `h-16 w-16 lg:h-24 lg:w-24` : 'h-12 w-12'

  return (
    <>
      {service.iconService ? (
        <img
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
