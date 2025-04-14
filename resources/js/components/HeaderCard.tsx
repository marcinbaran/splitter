import {Button, Card, CardProps} from "antd";
import {router, usePage} from "@inertiajs/react";
import {ArrowLeftOutlined} from "@ant-design/icons";
import React, {ReactNode, useCallback} from "react";
import {getBackUrl} from "@/lib/url-helper";
import clsx from "clsx";

type Props = {
    backButtonUrl?: string,
    /**
     * Works only with "expanded" prop
     */
    subtitle?: ReactNode,
    /**
     * Works only with "expanded" prop
     */
    icon?: ReactNode,
    expanded?: boolean,
} & CardProps

export default function HeaderCard({backButtonUrl, subtitle, icon, expanded, ...props}: Props) {
    const {previousUrl} = usePage().props

    const handleClickBackButton = useCallback(() => {
        if (!backButtonUrl || !previousUrl) return

        const backUrl = getBackUrl(backButtonUrl!, previousUrl as string)

        router.visit(backUrl)
    }, [backButtonUrl, previousUrl])

    const renderTitle = () => {
        if (!props.title && !backButtonUrl)
            return null

        return (
            <div className="flex items-center gap-x-3">
                {!!backButtonUrl && (
                    <Button
                        icon={<ArrowLeftOutlined/>}
                        onClick={handleClickBackButton}
                    />
                )}

                {!expanded && props.title}
            </div>
        )
    }

    const displayExpandedHeader = !!(expanded && (icon || props.title || subtitle))
    const displayCard = displayExpandedHeader ? !!(props.children || backButtonUrl || props.extra) : true

    return (
        <>
            {displayExpandedHeader && (
                <div className="mb-6 pl-4 pt-4 lg:pt-0">
                    <h2 className="font-bold text-xl sm:text-3xl m-0 mb-3">
                        {icon && (
                            <span className="mr-2">
                                {icon}
                            </span>
                        )}
                        {props.title}
                    </h2>

                    {!!subtitle && (
                        <h4 className="font-medium sm:text-lg m-0">
                            {subtitle}
                        </h4>
                    )}
                </div>
            )}

            {displayCard && (
                <Card
                    className="mb-4"
                    {...props}
                    styles={{
                        title: {
                            flex: props.extra ? 'unset' : undefined,
                        },
                        ...props.styles,
                    }}
                    classNames={{
                        header: '!border-0',
                        body: '!p-0',
                        title: clsx(props.extra && 'flex-none'),
                        extra: clsx(props.extra && 'flex justify-end flex-1 pl-1'),
                    }}
                    title={renderTitle()}
                />
            )}
        </>
    )
}

